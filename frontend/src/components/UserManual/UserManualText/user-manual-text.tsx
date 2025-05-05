import { useState } from "react";
import { Box, Collapse, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Define the interface for each section
interface Section {
  title: string;
  description: string;
}

// Define the interface for the component props
interface UserManualWelcomeTextProperties {
  title: string;
  message: string;
  sections: Section[];
}

// Use the interface to type the component props
export const UserManualText = ({ title, message, sections }: UserManualWelcomeTextProperties) => {
  const [expanded, setExpanded] = useState(false);

  return (
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
      <Box sx={{ fontSize: "20px", fontWeight: "bold", color: "#d7c8e8" }}>{title}</Box>
      <hr/>
      <Box sx={{ fontSize: "16px", textAlign: "left" }}>
        {message.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </Box>
      <Collapse in={expanded}>
        {sections.map((section, index) => (
          <Box key={index} sx={{ marginTop: "20px" }}>
            <hr/>
            <Box sx={{ fontSize: "18px", fontWeight: "bold", color: "#d7c8e8" }}>{section.title}</Box>
            <hr/>
            <Box sx={{ marginTop: "5px", textAlign: "justify" }}>
              {section.description.split("\n").map((line, index) => (
                <span key={index}>
                  {line}
                  <br />
                </span>
              ))}
            </Box>
          </Box>
        ))}
      </Collapse>
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
        }}
      >
        {expanded ? "Hide Details" : "Show More"}
      </Button>
    </Box>
  );
};