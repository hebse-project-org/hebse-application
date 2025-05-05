import { TextField, IconButton, Tooltip, Box } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";


interface HelpTextFieldProperties extends React.ComponentProps<typeof TextField> {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    tooltipText: string;
}

const HelpTextField: React.FC<HelpTextFieldProperties> = ({ tooltipText, sx, slotProps, ...properties }) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
            <Tooltip title={tooltipText} arrow>
                <IconButton>
                    <InfoOutlined style={{ color: "white" }} />
                </IconButton>
            </Tooltip>
            <TextField
                fullWidth
                variant="outlined"
                {...properties} // Passing all props dynamically
                sx={{
                    backgroundColor: "#2e2d2e",
                    borderRadius: "5px",
                    "& fieldset": { borderColor: "white" },
                    ...sx, // Custom styles
                }}
                slotProps={{
                    input: {
                        style: { fontFamily: "monospace", color: "white" },
                        ...slotProps?.input, // Merging slotProps input styles
                    },
                    inputLabel: {
                        style: { fontFamily: "monospace", color: "white" },
                        ...slotProps?.inputLabel, // Merging slotProps inputLabel styles
                    },
                }}
            />
        </Box>
    );
};

export default HelpTextField;
