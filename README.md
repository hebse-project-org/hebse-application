# hebse-application
## About

The development of **HEBSE** is the result of a two-semester Senior Design project by an interdisciplinary team of Computer, Software, and Cyber Security Engineers from Iowa State University.

The process involved:

- Identifying functional and non-functional requirements
- Consulting academic literature
- Analyzing design options and selecting suitable tools/technologies
- Implementing using an agile methodology
- Performing detailed and thorough testing

**HEBSE** is made available to the public *as is*, with no warranty or commitment for technical support.

However, we have prepared a comprehensive document detailing:
- The evolution of the project
- Testing methodologies
- A complete user manual for installation and updates

To access the documentation and learn more about the passionate team behind this project, please visit:  
👉 [https://sdmay25-20.sd.ece.iastate.edu/](https://sdmay25-20.sd.ece.iastate.edu/)

---

> Background image for the aplication is from Phil Brewer on [Astrobin](https://app.astrobin.com/i/jfo1on)


## How to Run

1. Clone the HEBSE repository to your local machine.
2. Install PostgreSQL on the device where you want to store the data.
3. Run the PowerShell script `HEBSE.ps1`.
4. Connect HEBSE to the database using the **Settings** page.
5. Initialize the dataset in the database using the **Utilities** page in HEBSE.
6. Make your first query!
7. For more information, refer to the user manual, which is available within the application or at the bottom of this README.

---

## Welcome to the Manual

Welcome to **HEBSE**, the Holistic Exploration of Binary Stellar Evolutions — the perfect tool for examining POSYDON-generated data!  
This is the user manual, where you'll find guidance on how to use and set up HEBSE.

---

## Setting Up and Connecting a PostgreSQL Database

### Setting Up a PostgreSQL Database

To set up a PostgreSQL database on your server or local device:

- Visit the official PostgreSQL website to download the installer: https://www.postgresql.org/download/
- Select your operating system and follow the installation instructions.
- After installation, open the PostgreSQL command line (PSQL) or use a GUI tool like pgAdmin to create a new database.
- Record your connection details: host (e.g., `localhost`), port (default is 5432), username, password, and the database name.

### Connecting HEBSE to the PostgreSQL Instance

To connect HEBSE to your PostgreSQL instance:

- Open the HEBSE application and go to the **Settings** section.
- Find the **Database Connection Setup** area.
- Enter the following details:
  - **Host**: e.g., `localhost`
  - **Port**: Default is 5432
  - **Username**: Your PostgreSQL username
  - **Password**: Your PostgreSQL password
  - **Database**: The name of your database
- Click **Save** to establish the connection.

### Downloading and Initializing the Database

- Ensure your database is connected before proceeding.
- Navigate to the **Utilities** page in HEBSE.
- For each POSYDON dataset, you can:
  - Click **SHOW DESCRIPTION** to view dataset details.
  - Click **DOWNLOAD** to save the dataset to your device.
  - Click **CREATE DATABASE USING DATASET** to automatically download and populate your PostgreSQL database.

### Important Notes

- Ensure PostgreSQL is running before connecting.
- Double-check your connection details.
- Dataset files can be large — verify your storage and internet connection.
- Initializing the database may take time depending on dataset size.

---

## Database Connection Setup

### Selecting a Database

- **Dropdown Menu**: Select an existing configuration or "Add New Database."
- Existing databases will auto-fill form fields; new entries clear them.

### Configuring Database Connection

Fill in the following:

- **Host**: e.g., `localhost` or an IP address
- **Port**: Default is 5432
- **Username**
- **Password** (toggle visibility with eye icon)
- **Database Name**: A unique name for your connection

### Remote Database Connection

For remote databases using SSH tunneling:

- Enable the **Remote Database** switch.
- Fill in SSH details:
  - **SSH Host**
  - **SSH Port** (default is 22)
  - **SSH Username**
  - **SSH Password/Private Key**

### Saving and Removing Configurations

- **Save Settings**: Stores or updates your configuration.
- **Remove Database**: Deletes the selected configuration.

### Important Notes

- Use unique names to prevent conflicts.
- Verify SSH private key format.
- Configurations are stored in your browser's local storage.

---

## OpenAI API Connection Setup

### Entering the API Key

- Use the **API Key** field to enter your OpenAI key.
- Toggle visibility with the eye icon.

### Selecting the GPT Model

- In the **Model** field, enter model name (e.g., `gpt-4` or `gpt-3.5-turbo`).
- See the OpenAI docs for the full list: https://platform.openai.com/docs/models

### Setting Max Tokens

- Adjust the `max_tokens` and `temperature` to fine-tune output.

### Saving the Settings

- Click **Save API Settings** to store your configuration locally.

### Important Notes

- Keep your API key secure.
- Double-check model names.
- Settings are saved locally and not transmitted to any server.

---

## How to Make a Query

### Using AI Query Assistance

- On the Query page, locate the **Query Assistance** box.
- Type your prompt in **Ask GPT**.
- Click **Query** to generate an AI-assisted SQL query.

### Submitting SQL Query

- Enter your SQL query in the **SQL Query Input** box.
- Click **Save** to store it, or **Search** to run it.
- Results appear in the **Query Results** section.

### Viewing Query Results

- Results are displayed in the **Query Results** box on the Query page.

---

## Downloading Query Results

### Locating the Download Button

- In the **Query Results** section, look for the download icon (↓).

### Downloading the Results

- Click the icon to download the results as `query_results.csv`.

### File Format

- The file is in CSV format, compatible with Excel, Google Sheets, etc.

---

## Viewing and Downloading Query History

### Accessing the History Page

- Navigate to the **History** section (back arrow icon).

### Viewing Past Queries

- The table shows columns: Query ID, SQL query, timestamp, and Download.
- Use pagination to browse multiple pages.

### Downloading Query Results

- Click the download icon (↓) next to a query to save results as `query_[ID]_results.csv`.

### Troubleshooting

- Ensure the server is active at `http://localhost:8000`.
- Check the browser console for errors if downloads fail.
- Verify a stable internet connection.

---
