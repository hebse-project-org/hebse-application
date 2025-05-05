from glob import glob
import os
import logging
import binascii
import subprocess
import sys
import numpy as np
import h5py
import pandas as pd
from sqlalchemy import create_engine, exc, text
import sqlalchemy_utils


# --------------------------------------------------------------------------
# HOW TO RUN:
#   python hebse_uploader.py <userDirectory> <datasetFileName> <database> \
#   <databaseUsername> <databasePassword> <databaseHost> <databasePort>
#
# DEFAULTS:
#   userDirectory      = Must be included
#   datasetFileName    = Must be included
#   database           = 'hebse'
#   databaseUsername   = 'postgres'
#   databasePassword   = 'root'
#   databaseHost       = 'localhost'
#   databasePort       = '5432'
#
# NOTE:
#   You can also set these values in the Hebse application UI by saving
#   your configuration before you trigger the build/upload process.


def fill_missing_values(data):
    if data.isna().any().any():
        data.interpolate(method='linear', axis=0, inplace=True, limit_direction='both')
    return data


def convert_hex_to_readable(data):
    if isinstance(data, bytes):
        try:
            return data.decode('utf-8', errors='ignore')
        except UnicodeDecodeError:
            return binascii.hexlify(data).decode('utf-8')
    elif isinstance(data, (list, pd.Series, np.ndarray)):
        # Recursively convert lists, Pandas Series, or NumPy arrays
        return [convert_hex_to_readable(item) for item in data]
    elif isinstance(data, np.void):
        # Convert numpy.void to a tuple of its elements
        return tuple(data.tolist())
    return data


def visit_all_items(name, obj, dataset_list):
    if isinstance(obj, h5py.Dataset):
        dataset_list.append((name, obj))
    elif isinstance(obj, h5py.Group):
        for key, item in obj.items():
            visit_all_items(f"{name}/{key}", item, dataset_list)


def create_database(engine, h5_files):
    with engine.connect() as connection:
        try:
            connection.execute(text("CREATE SCHEMA IF NOT EXISTS history;"))
            connection.execute(text("CREATE TABLE history.completed_queries(id SERIAL PRIMARY KEY, query_SQL text, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"))
            connection.commit()
        except Exception as e:
            logging.error(f"Error creating schema or table: {e}")
            raise

    for file_path in h5_files:
        with h5py.File(file_path, 'r') as hdf_file:
            # List to collect all datasets in the file
            dataset_list = []
            hdf_file.visititems(lambda name, obj, dataset_list=dataset_list: visit_all_items(name, obj, dataset_list))

            # Loop through each dataset collected
            for dataset_name, dataset in dataset_list:
                # Load dataset into a pandas DataFrame
                raw_data = dataset[()]

                # Handle compound datasets (structured arrays)
                if isinstance(raw_data, np.ndarray) and raw_data.dtype.names is not None:
                    # Create DataFrame from structured array
                    data = pd.DataFrame.from_records(raw_data)
                else:
                    # Convert data if it's hex encoded or contains complex types
                    data_converted = convert_hex_to_readable(raw_data)

                    # Ensure data is in a 2D format for DataFrame
                    if isinstance(data_converted, np.ndarray):
                        if data_converted.ndim == 1:
                            # Each dataset row is treated as a separate run, use dataset attributes for columns if available
                            data = pd.DataFrame(data_converted.reshape(1, -1))
                        elif data_converted.ndim == 2:
                            data = pd.DataFrame(data_converted)
                        else:
                            data = pd.DataFrame(data_converted.flatten().reshape(-1, 1))
                    else:
                        data = pd.DataFrame([data_converted])

                # Assign default column names based on dataset attributes or generate generic ones
                if dataset.dtype.names is not None:
                    columns = [name.decode('utf-8') if isinstance(name, bytes) else name for name in dataset.dtype.names]
                elif data.shape[1] > 1:
                    columns = [f"Column_{i + 1}" for i in range(data.shape[1])]
                else:
                    columns = [dataset_name.split('/')[-1]]

                data.columns = columns

                # Fill missing values by averaging surrounding points
                data = fill_missing_values(data)

                sanitized_table_name = ""

                # Determine the table name and run number based on dataset_name
                if "final_profile1" in dataset_name:
                    sanitized_table_name = "final_profile"
                elif "history1" in dataset_name:
                    sanitized_table_name = "history"
                else:
                    sanitized_table_name = dataset_name.split('/')[-1]

                if "run" in dataset_name:
                    run_number = int(''.join(filter(str.isdigit, dataset_name)))
                    data["run_number"] = run_number

                # Insert data into SQL table
                extension = ""
                version = 1
                while True:
                    try:
                        data.to_sql(f"{sanitized_table_name}{extension}", engine, if_exists='append', index=False)
                        break
                    except exc.ProgrammingError:
                        version += 1
                        extension = f"v{version}"


def get_engine():
    # PostgreSQL credentials
    database = sys.argv[3] if len(sys.argv) > 3 else 'hebse'
    username = sys.argv[4] if len(sys.argv) > 4 else 'postgres'
    password = sys.argv[5] if len(sys.argv) > 5 else 'root'
    host     = sys.argv[6] if len(sys.argv) > 6 else 'localhost'
    port     = sys.argv[7] if len(sys.argv) > 7 else '5432'

    # Connect to PostgreSQL
    engine = create_engine(f'postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}')
    if not sqlalchemy_utils.database_exists(engine.url):
        sqlalchemy_utils.create_database(engine.url)
    return engine


if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(filename='h5_import_errors.log', level=logging.ERROR, format='%(asctime)s %(message)s')

    subprocess.run(["tar", "-xvzf", sys.argv[1]], check=False)

    # Directory containing H5 files
    base_directory = f"/home/{sys.argv[2]}/{sys.argv[1].split('.')[0]}"

    # Find all H5 files in the directory and subdirectories
    files = glob(os.path.join(base_directory, '**', '*.h5'), recursive=True)
    create_database(get_engine(), files)
