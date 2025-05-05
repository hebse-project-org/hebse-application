import {useEffect, useState} from "react";
import {Box, Button, IconButton, InputAdornment, Paper, Typography} from "@mui/material";
import {Save, Visibility, VisibilityOff} from "@mui/icons-material";
import {styled} from "@mui/material/styles";
import HelpTextField from "../../HelpTextField/help-text-field.tsx";
import {encrypt, decrypt} from "../../Utilities/utility-functions.ts";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: "30px",
    borderRadius: "12px",
    backdropFilter: "blur(24px)",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "#2e2d2e",
    boxShadow: theme.shadows[1],
    color: "#d7c8e8",
    fontFamily: "monospace",
}));

const GptSetup = () => {
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("gpt-4o-mini");
    const [maxTokens, setMaxTokens] = useState("1000");
    // const [temperature, setTemperature] = useState("0.7");
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem("gpt_settings");
        if (!savedSettings) return;
      
        //decrypts the settings before using the json.
        decrypt(savedSettings).then((decrypted) => {
          try {
            const parsedSettings = JSON.parse(decrypted);
            setApiKey(parsedSettings.apiKey || "");
            setModel(parsedSettings.model || "gpt-4");
            setMaxTokens(parsedSettings.max_tokens?.toString() || "100");
            // setTemperature(parsedSettings.temperature?.toString() || "0.7");
          } catch (error) {
            console.error("Failed to parse decrypted GPT settings:", error);
          }
        }).catch((error) => {
          console.error("Failed to decrypt GPT settings:", error);
        });
      }, []);
      
    const handleSave = () => {
        const settings = {
          apiKey,
          model,
          max_tokens: Number.parseInt(maxTokens, 10),
          // temperature: Number.parseFloat(temperature),
        };
      
        //encrypts the settings and saves them to localStorage
        encrypt(JSON.stringify(settings)).then(enc => {            
          localStorage.setItem("gpt_settings", enc);
          alert("Settings saved!");  
        });
      };

    const apiKeyInputProperties = {
        endAdornment: (
            <InputAdornment position="end">
                <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                    {showApiKey ? <VisibilityOff sx={{ color: "white" }} /> : <Visibility sx={{ color: "white" }} />}
                </IconButton>
            </InputAdornment>
        ),
    };


return (
    <Box sx={{ width: "100%" }}>
        <StyledPaper elevation={6}>
            <Typography variant="h4" sx={{ fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', marginBottom: "20px"}}>
                GPT API Settings
            </Typography>

            {/* API Key Field with Visibility Toggle */}
            <HelpTextField
                label="API Key"
                value={apiKey}
                onChange={(input) => setApiKey(input.target.value)}
                type={showApiKey ? "text" : "password"}
                tooltipText="Enter your OpenAI API Key. This key is required to access GPT models."
                // inputProps={apiKeyInputProperties}
                slotProps={{ input: apiKeyInputProperties }}
            />

            {/* Model Selection Field */}
            <HelpTextField
                label="Model (e.g., gpt-4, gpt-o4-mini)"
                value={model}
                onChange={(input) => setModel(input.target.value)}
                tooltipText="Specify which GPT model you want to use. Example: 'gpt-4' or 'gpt-3.5-turbo'. A full list of models can be found on the OpenAI API documentation, or at https://platform.openai.com/docs/models."
            />

            {/* Max Tokens and Temperature Fields */}
            <Box sx={{ display: "flex", gap: "15px", marginTop: "15px" }}>
                <HelpTextField
                    label="Max Tokens"
                    type="number"
                    value={maxTokens}
                    onChange={(input) => setMaxTokens(input.target.value)}
                    tooltipText="Maximum number of tokens the model can generate. A higher value means longer responses."
                />
            
            </Box>

            {/* Save Button */}
            <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {/* Save Button */}
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#0b9e26",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        color: "white",
                        flex: 1,
                    }}
                    onClick={handleSave}
                    startIcon={<Save />}
                >
                    SAVE API SETTINGS
                </Button>
            </Box>
        </StyledPaper>
    </Box>
);

};

export default GptSetup;
