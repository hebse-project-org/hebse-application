import { Box } from "@mui/material";
import GPTSetup from "./GPTSetup/gpt-setup.tsx";
import DatabaseSetup from "./DatabaseSetup/database-setup.tsx";
import { SettingsWelcomeText } from "./SettingsWelcomeText/settings-welcome-text.tsx";

export const Settings = () => {
    return (
        <Box sx={{  display: "flex", 
                    justifyContent: "center", 
                    padding: "20px",
                    minHeight: "100vh"}}>
            <Box sx={{ 
                maxWidth: "1150px", 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px"
            }}>
                {/* Centered Welcome Text */}
                <Box sx={{ display: "flex", justifyContent: "center"}}>
                    <SettingsWelcomeText />
                </Box>                
            <Box
                sx={{
                    maxWidth: "1150px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >
                {/* GPT Query Form Component */}
                <GPTSetup />
                {/* Database Setup Component */}
                <DatabaseSetup />
            </Box>
        </Box>
        </Box>
    );
};
