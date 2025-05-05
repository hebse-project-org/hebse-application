import { Box } from "@mui/material";
import { UserManualText } from "./UserManualText/user-manual-text.tsx";

export const UserManual = () => {
    return (
        <Box sx={{
            maxWidth: "1150px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex",
            marginTop: "120px",
            marginBottom: "20px",
            gap: "20px"
        }}>

            <Box
                sx={{
                    backgroundColor: "#2e2d2e",
                    borderRadius: "15px",
                    maxWidth: "1150px",
                    width: "1150px",
                    fontFamily: "monospace",
                    padding: "10px",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <hr/>
                <Box sx={{ fontSize: "25px", fontWeight: "bold", color: "#d7c8e8" }}>{"Welcome to the Manual"}</Box>
                <hr/>
                <Box sx={{ fontSize: "16px", textAlign: "justify" }}>{"Welcome to HEBSE, the Holistic Exploration of Binary Stellar Evolutions, the perfect tool for examining POSYDON generated data! This is the user manual. Here you will find information on how to use and set up HEBSE."}</Box>
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="Setting Up and Connecting a PostgreSQL Database"
                    message="This guide walks you through setting up a PostgreSQL database, connecting it to the HEBSE application, and downloading/initializing datasets from the utilities page."
                    sections={[
                        {
                            title: "Setting Up a PostgreSQL Database",
                            description: "To set up a PostgreSQL database on your server or local device:\n- Visit the official PostgreSQL website to download the installer: https://www.postgresql.org/download/\n- Select your operating system and follow the provided installation instructions.\n- Once installed, open the PostgreSQL (PSQL) command line or a GUI tool (like pgAdmin) to create a new database.\n- Take note of and write down the connection details: host (e.g., 'localhost' for local setups), port (default is 5432), username, password, and the database name you created."
                        },
                        {
                            title: "Connecting HEBSE to the PostgreSQL Instance",
                            description: "To connect HEBSE to your PostgreSQL instance:\n- Open the HEBSE application and go to the 'Settings' section using the navigation bar.\n- Locate the 'Database Connection Setup' area.\n- Recall the connection details from the database setup.\n- Enter the following details:\n  - Host: The server address (e.g., 'localhost').\n  - Port: Typically 5432 unless changed during set up.\n  - Username: Your PostgreSQL username.\n  - Password: Your PostgreSQL password.\n  - Database: The name of the database you created.\n- Click 'Save' to establish the connection."
                        },
                        {
                            title: "Downloading and Initializing the Database",
                            description: "To download and initialize datasets using the utilities page:\n- Please ensure that you have already created and connected to the desired database before proceeding with this step. \n- Navigate to the 'Utilities' page in HEBSE.\n- You’ll see a list of publicly available POSYDON datasets. For each dataset, you can:\n  - Click 'SHOW DESCRIPTION' to reveal the dataset’s details (click 'HIDE DESCRIPTION' to collapse it).\n  - Click 'DOWNLOAD' to save the dataset file to your device (a tooltip shows the file name and size in GB).\n  - Click 'CREATE DATABASE USING DATASET' to automatically download the dataset and populate your connected PostgreSQL database.\n- The 'CREATE DATABASE USING DATASET' option triggers a process that uses the dataset file to initialize the database, making it ready for use."
                        },
                        {
                            title: "Important Notes",
                            description: "- Ensure PostgreSQL is running before attempting to connect HEBSE.\n- Double-check your connection details to avoid errors.\n- Dataset files can be large (sizes are shown in the tooltip); ensure you have enough storage and a reliable internet connection.\n- The 'CREATE DATABASE USING DATASET' feature requires a valid database connection and may take time depending on the dataset size."
                        }
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="Database Connection Setup"
                    message="This section guides you through configuring and managing PostgreSQL database connections using the Database Setup component. You can set up connections to both local and remote databases, with support for SSH tunneling for remote connections."
                    sections={[
                        {
                            title: "Selecting a Database",
                            description: "- Dropdown Menu: Use the dropdown to select an existing database configuration or choose \"Add New Database\" to create a new one.\n- Existing Database: Selecting an existing database loads its saved configuration into the form fields.\n- New Database: Choosing \"Add New Database\" clears the form fields for a fresh configuration."
                        },
                        {
                            title: "Configuring Database Connection",
                            description: "Fill in these fields to set up your database connection:\n- Host: Enter the hostname or IP address of the PostgreSQL server (e.g., localhost or 192.168.1.1).\n- Port: Enter the port number for the PostgreSQL server (default is 5432).\n- Username: Enter the database username.\n- Password: Enter the database password. Use the eye icon to toggle visibility.\n- Database Name: Enter a unique name for the database you want to connect to."
                        },
                        {
                            title: "Remote Database Connection",
                            description: "For databases hosted remotely with SSH tunneling:\n- Remote Switch: Toggle the \"Remote Database\" switch to enable remote settings.\n- SSH Fields: Complete these additional fields:\n- SSH Host: Enter the SSH host for tunneling (e.g., example.com).\n- SSH Port: Enter the SSH port (default is 22).\n- SSH Username: Enter your SSH username on the remote host.\n- SSH Password/Private Key: Paste your SSH private key or password (ensure it’s correctly formatted)."
                        },
                        {
                            title: "Saving and Removing Configurations",
                            description: "- Save Settings: Click \"Save Database Settings\" to store the configuration. It updates an existing database or adds a new one to the list.\n- Remove Database: \nIf an existing database is selected, a \"Remove Database\" button appears. Click it to delete the selected configuration."
                        },
                        {
                            title: "Important Notes",
                            description: "- Unique Database Name: Ensure the \"Database Name\" is unique to avoid conflicts.\n- SSH Key Format: For remote connections, verify that your SSH private key is correctly formatted and matches the SSH user and host.\n- Local Storage: Configurations are saved in your browser’s local storage."
                        },
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="OpenAI API Connection Setup"
                    message="This section guides you through configuring the settings for connecting to the OpenAI API, including entering your API key, selecting the GPT model, and setting parameters like max tokens and temperature."
                    sections={[
                        {
                            title: "Entering the API Key",
                            description: "Use the 'API Key' field to enter your OpenAI API key, which is necessary for authenticating requests to the OpenAI API. The eye icon allows you to toggle the visibility of the key for added security."
                        },
                        {
                            title: "Selecting the GPT Model",
                            description: "In the 'Model' field, enter the name of the GPT model you want to use (e.g., 'gpt-4' or 'gpt-3.5-turbo'). For a complete list of available models, refer to the OpenAI API documentation at https://platform.openai.com/docs/models."
                        },
                        {
                            title: "Setting Max Tokens",
                            description: "Adjust the following parameters to fine-tune the GPT model's behavior:"
                        },
                        {
                            title: "Saving the Settings",
                            description: "Once you have entered your desired settings, click the 'Save API Settings' button to store them. The settings are saved in your browser's local storage, ensuring they persist across sessions."
                        },
                        {
                            title: "Important Notes",
                            description: "- Keep your API key secure and do not share it publicly.\n- Ensure the model name is correctly entered as specified in the OpenAI documentation.\n- Experiment with different max tokens and temperature values to find the optimal settings for your use case.\n- All configurations are stored locally in your browser and are not transmitted to any server."
                        }
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="How to Make a Query"
                    message="This section explains how to generate and submit a query."
                    sections={[
                        {
                            title: "Using AI Query Assistance",
                            description: "On the query page locate the \"Query Assistance\" box. Type your prompt into the \"Ask GPT\" field. Press the \"Query\" button. The AI assisted SQL query will show up below. For best results use prompts that are formatted as a question."
                        },
                        {
                            title: "Submitting SQL Query",
                            description: "To submit an SQL query, either copy an AI assisted SQL query from the \"Query Assistance\" box or write your own SQL query, and enter the SQL query into the \"SQL Query Input\" box. Press \"Save\" to save the query for future use. Press \"Search\" to submit the Query. The result of the Query will appear below in the \"Query Results\" box."
                        },
                        {
                            title: "Viewing Query Results",
                            description: "To view query results after submitting a query, look at the \"Query Results\" box on the \"Query\" page."
                        },
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="Downloading Query Results"
                    message="This section explains how to download query results as a CSV file for further use."
                    sections={[
                        {
                            title: "Locating the Download Button",
                            description: "In the 'Query Results' section, find the download button with a download icon (↓) next to the 'Query Results' title."
                        },
                        {
                            title: "Downloading the Results",
                            description: "Click the download button to fetch the complete query results from the server. The results are saved as 'query_results.csv' and automatically downloaded to your device."
                        },
                        {
                            title: "File Format",
                            description: "The file is in CSV format, compatible with spreadsheet software like Microsoft Excel or Google Sheets."
                        }
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="Viewing and Downloading Query History"
                    message="This section explains how to use the history page to view past queries and download their results."
                    sections={[
                        {
                            title: "Accessing the History Page",
                            description: "Go to the 'History' section, denoted by a backward arrow, to see a table listing your past queries, including their ID, SQL query, and timestamp."
                        },
                        {
                            title: "Viewing Past Queries",
                            description: "The table includes columns for 'Query ID', 'Query' (the SQL statement), 'Queried' (timestamp), and 'Download'. Use the pagination controls at the bottom to browse through multiple pages of queries if available."
                        },
                        {
                            title: "Downloading Query Results",
                            description: "Each row features a download button with a downward arrow icon (↓). Click this button to retrieve the query results from the server and save them as a CSV file named 'query_[ID]_results.csv', where [ID] is the Query ID."
                        },
                        {
                            title: "Troubleshooting",
                            description: "If you encounter issues:\n- Verify the server is active at 'http://localhost:8000'.\n- Look in the browser console for error messages if the download fails.\n- Ensure a stable internet connection."
                        }
                    ]}
                />
            </Box>
            <Box sx={{}}>
                <UserManualText
                    title="Sample Queries"
                    message="This section provides several sample queries as an example."
                    sections={[
                        {
                            title: "Find stars with a mass in the top 2%, and with a metallicity between 1% and 10%",
                            description: "SELECT \"initial_values\".\"model_number\", \"initial_values\".\"star_1_mass\", \"initial_values\".\"star_2_mass\", \"Z\" FROM \"initial_values\" WHERE (\"initial_values\".\"star_1_mass\" > (SELECT (MAX(\"star_1_mass\") + MAX(\"star_2_mass\")) * 0.98 / 2 FROM \"initial_values\") OR \"initial_values\".\"star_2_mass\" > (SELECT (MAX(\"star_1_mass\") + MAX(\"star_2_mass\")) * 0.98 / 2 FROM \"initial_values\")) AND \"initial_values\".\"Z\" between 0.01 and 0.10"
                        },
                        {
                            title: "Find all systems which have a mass ratio between 0.5 and 0.7 and at some point an orbital period between 5 and 100 days",
                            description: "SELECT \"binary_history\".\"model_number\", \"binary_history\".\"age\" FROM \"binary_history\" WHERE (\"binary_history\".\"star_1_mass\" / \"binary_history\".\"star_2_mass\" BETWEEN 0.5 AND 0.7 OR \"binary_history\".\"star_2_mass\" / \"binary_history\".\"star_1_mass\" BETWEEN 0.5 AND 0.7) AND \"binary_history\".\"period_days\" BETWEEN 5 AND 100"
                        }
                    ]}
                />
            </Box>
        </Box>
    );
};
