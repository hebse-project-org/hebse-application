import { useState } from "react";
import { Box, Collapse, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export const SettingsWelcomeText = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box
  sx={{
    backgroundColor: "#2e2d2e",
    borderRadius: "15px",
    maxWidth: "lg",
    width: "100%",
    fontFamily: "monospace",
    padding: "20px",
    marginTop: "100px",
    /* remove textAlign here */
    color: "white",
  }}
>
      {/* Main title: centered */}
      <Box
        sx={{
          fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', color: "#d7c8e8"
        }}
      >
        Configure Your Settings
      </Box>

  {/* Intro copy: left‑aligned by default */}
  <Box sx={{ fontSize: "16px" }}>
    Welcome to the Settings page! Here you can customize and manage the tools that power your Binary Star Query Bot experience.
  </Box>

  <Collapse in={expanded}>
    {/* Section title: centered */}
    <Box
      sx={{
        fontSize: "20px",
        fontWeight: "bold",
        marginTop: "15px",
        textAlign: "center",
        color: "#d7c8e8"
      }}
    >
      GPT API Settings
    </Box>
    {/* Section body: left */}
    <Box sx={{ marginTop: "5px" }}>
      Enter your OpenAI API key, choose your preferred model (such as GPT-4), and customize parameters like max token count and response creativity (temperature). These settings allow the system to generate intelligent responses for natural language queries and schema help.
    </Box>

    {/* Another section title: centered */}
    <Box
      sx={{
        fontSize: "20px",
        fontWeight: "bold",
        marginTop: "20px",
        textAlign: "center",
        color: "#d7c8e8"
      }}
    >
      Database Connection
    </Box>
    {/* Section body: left */}
    <Box sx={{ marginTop: "5px" }}>
      Connect to your PostgreSQL database by specifying the host, port, username, and database name. You can also configure remote access with SSH tunneling if needed. All configurations are saved locally and can be updated or removed at any time.
    </Box>
  </Collapse>
  
  <Box
      sx={{
        textAlign: "center",
      }}
      >
      <Button
        onClick={() => setExpanded(!expanded)}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{
          marginTop: "10px",
          backgroundColor: "#5a50c7",
          fontFamily: "monospace",
          color: "white",
          textTransform: "none",
          fontWeight: "bold",
          align: "center",
        }}
      >
        {expanded ? "Hide Details" : "Show More"}
      </Button>
    </Box>
</Box>
  );
};
