# pylint: disable=global-statement
# pylint: disable=too-many-try-statements
# pylint: disable=unused-variable

import json
import traceback
import csv
from io import StringIO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import create_engine, text, MetaData
from openai import OpenAI
import sshtunnel
from paramiko import SSHClient, AutoAddPolicy, RSAKey
from scp import SCPClient


# Engine / SSH tunnel / schema metadata
engine = None
tunnel = None
metadata = MetaData()
schema_dict = {}

#start FastAPI
app = FastAPI()

# -------------------------------------------------
# CORS
# -------------------------------------------------
origins = ["http://localhost", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Decide how to open an SSH tunnel or connect local
#   - databaseHost, databasePort, databaseUsername, databasePassword, databaseName
#   - isRemote, sshHost, sshPort, sshUser, sshKey
#
# If "isRemote" is true, we attempt an SSH tunnel:
#   1) If "sshKey" looks like a private key (-----BEGIN),
#      parse and use that as ssh_pkey
#   2) Otherwise, treat sshKey as a password
# -------------------------------------------------
def configure_engine_from_settings(config: dict):  # pragma: no cover
    global engine, tunnel, schema_dict  

    # If we already have a tunnel, stop it before reconfiguring
    if tunnel is not None and tunnel.is_active:
        tunnel.stop()
        tunnel = None

    if config.get("isRemote"):
        # Prepare SSH connection details
        ssh_host = config["sshHost"]
        ssh_port = int(config["sshPort"])
        ssh_user = config["sshUser"]
    
        # The DB is hosted on remote side, so "database" is the remote DB port
        remote_db_port = int(config["databasePort"])

        # "sshKey" might be a private key OR a password
        ssh_key_text = config.get("sshKey", "")

        # Heuristic: If the text starts with a private key header,
        # treat it as an SSH key. Otherwise, treat as a password.
        if "-----BEGIN" in ssh_key_text:
            # Private key-based SSH
            pkey = RSAKey.from_private_key(StringIO(ssh_key_text))
            tunnel_obj = sshtunnel.SSHTunnelForwarder(
                (ssh_host, ssh_port),
                ssh_username=ssh_user,
                ssh_pkey=pkey,
                remote_bind_address=("127.0.0.1", remote_db_port),
            )
        else:
            # Password-based SSH
            tunnel_obj = sshtunnel.SSHTunnelForwarder(
                (ssh_host, ssh_port),
                ssh_username=ssh_user,
                ssh_password=ssh_key_text,
                remote_bind_address=("127.0.0.1", remote_db_port),
            )

        tunnel_obj.start()
        tunnel = tunnel_obj
        # Overwrite host/port so we connect locally to the tunnel
        db_host = "localhost"
        db_port = tunnel.local_bind_port
    else:
        # Local / direct DB
        db_host = config["databaseHost"]
        db_port = config["databasePort"]

    db_username = config["databaseUsername"]
    db_password = config["databasePassword"]
    db_name = config["databaseName"]

    # Build SQLAlchemy connection URL
    db_url = (
        f"postgresql+psycopg2://{db_username}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )

    # Create engine and reflect schema
    engine = create_engine(db_url)
    metadata.reflect(bind=engine)
    metadata.reflect(bind=engine)  # no assignment to metadata, so no global needed
    schema_dict = get_clean_schema_dict(metadata)  # load the data into a dictionary
    

# -------------------------------------------------
# Init database route
# -------------------------------------------------
@app.post("/init_db")
def init_database(body: dict):  # pragma: no cover
    db_config = body.get("db_settings")
    if not db_config:
        raise HTTPException(status_code=400, detail="Missing db_settings")

    try:
        configure_engine_from_settings(db_config)
        return {"message": "Database engine initialized."}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to initialize database: {e}") from e

# -------------------------------------------------
# Run a query
# -------------------------------------------------
@app.post("/GetData")
def get_data(body: dict):
    raw_query = body.get("query")
    history = body.get("history", False)
    if not raw_query:
        raise HTTPException(status_code=400, detail="Query key is required.")
    if engine is None:
        raise HTTPException(status_code=500, detail="Database engine not initialized.")

    try:
        with engine.connect() as connection:
            result = connection.execute(text(raw_query))
            rows = [row._mapping for row in result]

            if(not history):  # pragma: no cover
                log_query = text("INSERT INTO history.completed_queries (query_sql) VALUES (:query)")
                connection.execute(log_query, {"query": raw_query})
                connection.commit()

            if rows:
                create_csv(rows)
                return {"message": "Query executed successfully.", "data": rows}
            
            return {"message": "Query Returned 0 Matches", "data": rows}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e)) from e

# -------------------------------------------------
# Ask GPT
# -------------------------------------------------
@app.post("/ask_gpt")
def ask_gpt(request: dict):  
    
    user_query = request.get("query")
    settings = request.get("settings")
    default_gpt_model = "gpt-4o"  # default model if no model is provided.
    default_tokens = 1000  # default max tokens if no max_tokens is provided.

    if not user_query:
        raise HTTPException(status_code=400, detail="Query is required.")
    if not settings or "apiKey" not in settings:
        raise HTTPException(status_code=400, detail="GPT API key is missing.")

    try:  # pragma: no cover
        client = OpenAI(api_key=settings["apiKey"])
        response = client.chat.completions.create(
            model=settings.get("model", default_gpt_model),
            messages=[
                {
                    "role": "system",
                    "content": ("You are an AI assistant for generating PostgreSQL queries from natural language. You have a database schema below. "
                                "Rules: "
                                "1) Output ONLY the SQL query on the first line (no code fences). "
                                "2) Use \"table\".\"column\" for references, never \"table.column\". "
                                "3) Only use the columns in the schema. Never make up columns. "
                                "The json of the schema is as follows: ") + json.dumps(schema_dict),},

                {"role": "user", "content": user_query},],
            max_completion_tokens=int(settings.get("max_tokens", default_tokens))  # default=1000
        )

        return {"response": response.choices[0].message}
    except Exception as e:  # pragma: no cover
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e)) from e
# -------------------------------------------------
# TEST GPT
# -------------------------------------------------
@app.post("/test_gpt")
def test_gpt(request: dict): #pragma: no cover

    settings = request.get("settings")
    default_gpt_model = "gpt-4o" 
    default_tokens = 100  

    if not settings or "apiKey" not in settings:
        raise HTTPException(status_code=400, detail="GPT API key is missing.")

    try:
        client = OpenAI(api_key=settings["apiKey"])
        response = client.chat.completions.create(
            model=settings.get("model", default_gpt_model),
            messages=[
                {
                    "role": "system",
                    "content": ("This is a test, Send anything to aknowledge"),},],

            max_completion_tokens=int(settings.get("max_tokens", default_tokens))  # default=1000
        )

        return {"response": response.choices[0].message}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e)) from e


# -------------------------------------------------
# Config Engine Endpoint, used for setting up the engine to be tested in tox
# -------------------------------------------------
@app.post("/ConfigureEngine")
def configure_engine_api(config: dict):
    try:
        configure_engine_from_settings(config)
        return {"detail": "Engine configured from settings."}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

# -------------------------------------------------
# Write query results to CSV
# -------------------------------------------------
def create_csv(returned_data):
    with open("query_results.csv", mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(returned_data[0].keys())
        for row in returned_data:
            writer.writerow(row.values())

# -------------------------------------------------
# Download CSV
# -------------------------------------------------
@app.get("/exportData")
def export_data():  # pragma: no cover
    file_name = "query_results.csv"
    return FileResponse(file_name, media_type="text/csv", filename="query_results.csv")

# -------------------------------------------------
# Clean Schema
#   - Returns a dictionary of table names and their columns using the default sqlalchemy metadata object.
#   - Used by the GPT model to understand the schema in a natural way that reduces token bloat.
# -------------------------------------------------
def get_clean_schema_dict(meta: MetaData) -> dict:
    if not meta.tables:
        return {}

    clean_schema = {}
    for table_name, table_obj in meta.tables.items():
        column_names = [col.name for col in table_obj.columns]
        clean_schema[table_name] = column_names

    return clean_schema
# -------------------------------------------------------
# Download dataset from remote server and set up database
# -------------------------------------------------------
@app.put("/PutDatabase")
def setup_database(body: dict):  # pragma: no cover
    remote_file_path = body.get("filePath")
    local_file_name = body.get("fileName")
    db_settings = body.get("databaseSettings")
    print(f"Remote file path: {remote_file_path}")
    print(f"Local file name: {local_file_name}")

    try:
        ssh_client = SSHClient()
        ssh_client.set_missing_host_key_policy(AutoAddPolicy())
        ssh_client.connect(
            hostname=db_settings["sshHost"],
            username=db_settings["sshUser"],
            password=db_settings["sshKey"],
        )

        print("Downloading dataset...")
        stdin, stdout, sterr = ssh_client.exec_command(f"curl {remote_file_path} --output {local_file_name}", get_pty=True)  
        sterr.read()

        with SCPClient(ssh_client.get_transport()) as scp:
            scp.put("database/requirements.txt", "database/requirements.txt")
            scp.put("database/hebse_uploader.py", "database/hebse_uploader.py")

        print("Installing requirements...")
        stdin, stdout, sterr = ssh_client.exec_command("pip install -r database/requirements.txt", get_pty=True)  
        sterr.read()

        print("Creating database...")
        stdin, stdout, sterr = ssh_client.exec_command(f"python3 database/hebse_uploader.py {local_file_name} \"{db_settings['sshUser']}\" \"{db_settings['databaseName']}\" \"{db_settings['databaseUsername']}\" \"{db_settings['databasePassword']}\" \"{db_settings['databaseHost']}\" \"{db_settings['databasePort']}\"  ", get_pty=True)  # pylint: disable=unused-variable
        sterr.read()

        print("Cleaning up...")
        stdin, stdout, sterr = ssh_client.exec_command(f"rm {local_file_name}", get_pty=True)
        sterr.read()
        stdin, stdout, sterr = ssh_client.exec_command(f"rm -rf {local_file_name.split('.')[0]}", get_pty=True)
        sterr.read()


        return {"message": f"File downloaded successfully as {local_file_name}"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        ssh_client.close()

# -------------------------------------------------------
# Get history of queries that have already been performed.
# -------------------------------------------------------
@app.get("/getHistory")
def get_history(): # pragma: no cover
    try:
        with engine.connect() as connection:
            query = text(
                'SELECT * FROM "history"."completed_queries" ORDER BY time DESC LIMIT 20'
            )
            result = connection.execute(query)
            queries = [row._mapping for row in result]

            return {"recent_queries": queries}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch recent queries") from e
