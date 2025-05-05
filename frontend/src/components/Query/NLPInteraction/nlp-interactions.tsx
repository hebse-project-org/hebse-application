import {useEffect, useState} from "react";
import {Box, Checkbox, FormControlLabel, IconButton, InputAdornment, Typography, TextField, Tooltip, Button,} from "@mui/material";
import {AutoAwesome, CheckSharp, ErrorOutline, InfoOutlined} from "@mui/icons-material";
import {decrypt} from "../../Utilities/utility-functions.ts";

export const NlpInteractions = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(
    "Enter your request or question to GPT. The system can help format queries or provide general assistance."
  );

  // GPT connection checks
  const [gptConnected, setGptConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // -----------------------------------------------------------------
  // On mount, attempt a "ping" to /ask_gpt with a test query
  // to confirm GPT settings are valid. If success => connected.
  // -----------------------------------------------------------------
  useEffect(() => {
    const testGPTConnection = async () => {
        setCheckingConnection(true);
      try {
        // Grab GPT settings from localStorage
        const savedSettings = localStorage.getItem("gpt_settings");
        if (!savedSettings) {
          setGptConnected(false);
          return;
        }

        const decrypted = await decrypt(savedSettings);
        const parsedSettings = JSON.parse(decrypted);
        const payload = {
          query: "TEST", 
          settings: parsedSettings,
        };

        const result = await fetch("http://localhost:8000/test_gpt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!result.ok) {
          throw new Error(`Connection test failed: HTTP status ${result.status}`);
        }

        const data = await result.json();
        // If response exists, assume success
 
        if (data?.response) {
          setGptConnected(true);
        }
      } catch (error) {
        console.error(":", error);
        setGptConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    testGPTConnection();
  }, []);

  // -----------------------------------------------------------------
  // Handler to call the /ask_gpt endpoint with the user’s query
  // -----------------------------------------------------------------
  const handleQuery = async () => {
    setResponse("Awaiting GPT response...");
    try {
      const savedSettings = localStorage.getItem("gpt_settings");
      if (!savedSettings) {
        setResponse("GPT settings not found. Please set up your API key first.");
        return;
      }
      
      const decrypted = await decrypt(savedSettings);
      const parsedSettings = JSON.parse(decrypted);
      const payload = {
        query,
        settings: parsedSettings,
      };

      const result = await fetch("http://localhost:8000/ask_gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!result.ok) {
        throw new Error(`Server error: ${result.status}`);
      }

      const data = await result.json();
      // Backend response format: { response.content: "...GPT output..." }
      setResponse(data.response.content || "No response received from GPT.");
    } catch (error) {
      console.error("Error fetching GPT response:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#2e2d2e",
        flexGrow: 1,
        borderRadius: "15px",
        fontFamily: "monospace",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "top",
        alignItems: "center",
        height: "100%",
      }}
    >

      <Box sx={{ display: "flex", alignItems: "center", mb: 2, marginBottom: "15px", }}>
        <Typography variant="h5" sx={{ fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', color: "#d7c8e8"}}>
          Query Assistance
        </Typography>
        <Tooltip title={"Use this field to talk to GPT about query formatting or get general schema help."} arrow>
            <IconButton>
              <InfoOutlined style={{ color: "white" }} />
            </IconButton>
        </Tooltip>
      </Box>

      {/* Connection Status */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={gptConnected}
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
              ? "Checking GPT connection..."
              : (gptConnected
              ? "GPT Model is connected!"
              : "GPT Model is not connected. Check Settings -> GPT API Settings.")
          }
          sx={{ color: "white", fontFamily: "monospace", '& .MuiFormControlLabel-label': { fontFamily: 'monospace', color: "white" },'& .MuiFormControlLabel-label.Mui-disabled':{ color: "white !important", opacity: 1,}}}
        />
      </Box>

      {/* User input field for GPT query */}
      <Box sx={{ padding: "10px", width: "100%", marginBottom: "0px" }}>
        <TextField
          label="Ask GPT"
          value={query}
          onChange={(event_) => setQuery(event_.target.value)}
          id="outlined-basic"
          variant="outlined"
          fullWidth
          multiline
          minRows={6}
          maxRows={6}
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
            '& .MuiInputBase-root': {
              height: "auto",
              alignItems: "flex-start",
            },
            "& .MuiOutlinedInput-root": {
              padding: "8px", // Reduced padding
              "& fieldset": { borderColor: "white" },
              "&:hover fieldset": { borderColor: "white" },
              "&.Mui-focused fieldset": { borderColor: "white" },
            },
            "& .MuiInputBase-input": {
                color: "white",
                fontFamily: "monospace",
            },
          }}
        />
      </Box>
      <Box
        sx={{
            display: "flex",
            width: "100%", // Make sure buttons stay inside the parent box
            gap: "0px",
            marginTop: "0px",
            padding: "10px", // Ensure buttons don’t touch the edges
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
            onClick={handleQuery}
            startIcon={<AutoAwesome />}
        >
          QUERY
        </Button>
      </Box>
      {/* GPT Response area */}
      <Box
        sx={{
          marginTop: "5px",
          backgroundColor: "#3a303d",
          borderRadius: "5px",
          padding: "5px",
          border: "solid white",
          borderWidth: "1px",
          width: "100%",
          maxHeight: "95px", // or any height you want
          overflowY: "auto",   // enables vertical scrolling
        }}
      >
        <Typography sx={{ fontFamily: "monospace" }}>{response}</Typography>
      </Box>
    </Box>
  );
};

