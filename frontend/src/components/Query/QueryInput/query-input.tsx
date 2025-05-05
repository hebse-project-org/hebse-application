import Box from "@mui/material/Box";
import {Button, IconButton, TextField, Typography, InputAdornment, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {Save, Search, AutoAwesome,} from "@mui/icons-material";
import {useEffect, useState} from 'react';
import { CheckSharp, ErrorOutline } from '@mui/icons-material';
import { FormControlLabel, Checkbox } from '@mui/material';
import { decrypt } from "../../Utilities/utility-functions";
/* istanbul ignore file -- @preserve */

interface QueryInputProperties {
    onQueryResult: (result: string) => void;
    savedQueries: Record<string, string>[];
    setSavedQueries: (value: Record<string, string>[] | ((previousState: Record<string, string>[]) => Record<string, string>[])) => void;
    inputValue: string;
    setInputValue: (value: string | ((previousState: string) => string)) => void;
    setPageNumber: (value: number | ((previousState: number) => number)) => void;
}

export const QueryInput = ({
    onQueryResult,
    savedQueries,
    setSavedQueries,
    inputValue,
    setInputValue,
    setPageNumber}: QueryInputProperties) => {

        const [databaseConnected, setdatabaseConnected] = useState(false);
        const [checkingConnection, setCheckingConnection] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [queryName, setQueryName] = useState("");

        useEffect(() => {
        if ("saved" in localStorage) {
            setSavedQueries(JSON.parse(localStorage.saved));
        }
        }, [setSavedQueries]);

        useEffect(() => {
        const testDBConnection = async () => {
            try {
            const savedSettings = localStorage.getItem("db_settings");
            if (!savedSettings) {
                setdatabaseConnected(false);
                return;
            }
            const decrypted = await decrypt(savedSettings);
            const parsed = JSON.parse(decrypted);

            const result = await fetch("http://localhost:8000/init_db", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ db_settings: parsed }),
            });

            if (!result.ok) throw new Error("Connection failed");
            setdatabaseConnected(true);
            } catch (error) {
            console.error("DB connection check failed:", error);
            setdatabaseConnected(false);
            } finally {
            setCheckingConnection(false);
            }
        };

        testDBConnection();
        }, []);

        // Called on SEARCH
        async function getSQLFromNaturalLanguage() {
            const savedDatabaseSettings = localStorage.getItem("db_settings");
            if (!savedDatabaseSettings) {
                onQueryResult("Database settings not found.");
                return;
            }
            const decrypted = await decrypt(savedDatabaseSettings);
            const parsedDatabaseSettings = JSON.parse(decrypted);
        
            // Empty query check
            if (!inputValue.trim()) {
                onQueryResult("Query cannot be empty.");
                return;
            }
        
            if (!databaseConnected) {
                onQueryResult("Cannot query: database is not connected.");
                return;
            }
        
            const data = { query: inputValue, db_settings: parsedDatabaseSettings };
        
            try {
                const response = await fetch(`http://localhost:8000/GetData`, {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
        
                if (!response.ok) {
                    // Handle error response from the server
                    const errorBody = await response.json();
                    if (errorBody && errorBody.detail) {
                        onQueryResult(`Error from server: ${errorBody.detail}`);
                    } else {
                        onQueryResult(`An unknown error occurred: ${response.status}`);
                    }
                    return;
                }
        
                const body = await response.json();
                onQueryResult(body.data || "No result returned.");
                setPageNumber(0);

            } catch (error) {
                console.error("Error fetching query result:", error);
                onQueryResult("An error occurred while fetching the result.");
            }
        }
        

        function saveQuery() {
            if (!inputValue.trim()) {
                alert("Query cannot be empty.");
                return;
            }

            setIsModalOpen(true);
        }

        function handleSave() {
            if (!queryName.trim()) {
                alert("Query name cannot be empty.");
                return;
            }

            const isDuplicate = savedQueries.some(
                (item) => Object.keys(item)[0] === queryName.trim() && Object.values(item)[0] === inputValue
            );
        
            if (isDuplicate) {
                alert("This query is already saved under this name.");
                return;
            }
    
            const newQuery = { [queryName.trim()]: inputValue };
            const updatedQueries = [...savedQueries, newQuery];
            localStorage.setItem("saved", JSON.stringify(updatedQueries));
            setSavedQueries(updatedQueries);
            setIsModalOpen(false);
            setQueryName("");
        }

        return (
        <><Box
        sx={{
            backgroundColor: '#2e2d2e',
            flexGrow: 1,
            borderRadius: '15px',
            fontFamily: 'monospace',
            padding: '20px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '100%',
        }}
    >
        <Typography variant="h5" sx={{ fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', color: "#d7c8e8", }}>
            SQL Query Input
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={databaseConnected}
                        icon={<ErrorOutline style={{color: "red"}}/>}
                        checkedIcon={<CheckSharp />}
                        disabled
                        sx={{
                            color: "white",
                            "&.Mui-checked": {
                                color: "#0b9e26",
                            },
                        }}
                    />
                }
                label={
                    checkingConnection
                        ? "Checking DB connection..."
                        : (databaseConnected
                            ? "Database is connected!"
                            : "Database not connected. Check Settings -> Database.")
                }
                sx={{ color: "white", fontFamily: "monospace", '& .MuiFormControlLabel-label': { fontFamily: 'monospace', color: "white" }, '& .MuiFormControlLabel-label.Mui-disabled':{ color: "white !important", opacity: 1,} }}
            />
        </Box>
        <TextField
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            id="outlined-basic"
            label="Query"
            variant="outlined"
            fullWidth
            multiline
            minRows={12} // Match first TextField
            maxRows={12} // Match first TextField
            slotProps={{
                input: {
                startAdornment: (
                    <InputAdornment position="start">
                    <IconButton sx={{ width: 0, height: 0, opacity: 0, padding: 0, margin: 0 }}>
                        <AutoAwesome />
                    </IconButton>
                    </InputAdornment>
                ),
                },
                inputLabel: {
                    style: { fontFamily: "monospace", color: "white" },
                },
            }}
            sx={{
                width: "100%", 
                backgroundColor: "#3a303d",
                borderRadius: "6px",
                marginBottom: "8px",
                "& .MuiOutlinedInput-root": {
                padding: "8px", // Match first TextField
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "White" },
                "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiInputBase-input": {
                color: "white",
                fontFamily: "monospace",
                },
            }}
            />

        {/* Buttons Below the TextField */}
        <Box
            sx={{
                display: "flex",
                width: "100%",
                gap: "10px",
                marginTop: "10px",
                padding: "10px",
            }}
        >
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#5a50c7",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "white",
                    flex: 1,
                }}
                onClick={getSQLFromNaturalLanguage}
                startIcon={<Search />}
            >
                SEARCH
            </Button>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#0b9e26",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "white",
                    flex: 1,
                }}
                onClick={saveQuery}
                startIcon={<Save />}
            >
                SAVE
            </Button>
        </Box>
    </Box>

    <Dialog open={isModalOpen} onClose={() => {setIsModalOpen(false); setQueryName("");}} sx={{"& .MuiPaper-root": {borderRadius: "15px", boxShadow: "none"}}}>
        <DialogTitle sx={{ fontFamily: "monospace", color: "white", backgroundColor: "#2e2d2e" }}>
            Save Query
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#2e2d2e" }}>
            <TextField
                autoFocus
                margin="dense"
                label="Query Name"
                type="text"
                fullWidth
                variant="outlined"
                value={queryName}
                onChange={(value) => setQueryName(value.target.value)}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "white" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "white" },
                    },
                    "& .MuiInputBase-input": {
                        color: "white",
                        fontFamily: "monospace",
                    },
                    "& .MuiInputLabel-root": {
                        color: "white",
                        fontFamily: "monospace",
                    },
                }}
            />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#2e2d2e" }}>
            <Button
                onClick={() => {setIsModalOpen(false); setQueryName("");}}
                sx={{
                    backgroundColor: "#5a50c7",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "white",
                    flex: 1,
                }}
            >
            Cancel
            </Button>
            <Button
                onClick={handleSave}
                sx={{
                    backgroundColor: "#0b9e26",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "white",
                    flex: 1,
                }}
            >
            Save
            </Button>
        </DialogActions>
    </Dialog>
    </>);
};