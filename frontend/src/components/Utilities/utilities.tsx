import { Box } from "@mui/material";
import Downloader from "./DataDownload/data-download.tsx";

export const Utilities = () => {
    return (
        <Box 
            sx={{
                minHeight: "100vh",
            }}
        >
            <Box
                sx={{
                    paddingTop: "120px",
                    paddingBottom: "16px",
                    width: "1150px",
                    color: "#d7c8e8"
                }}
            >
                <Downloader />
            </Box>
        </Box>
    );
};
