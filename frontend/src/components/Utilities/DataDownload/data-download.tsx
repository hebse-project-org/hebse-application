// https://zenodo.org/records/14205146/files/POSYDON_data.tar.gz?download=1
import {Paper, Tooltip, Typography, Box, Button, Collapse} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFile from "@mui/icons-material/UploadFile";
import {useEffect, useState} from 'react';
import {styled} from "@mui/material/styles";
import { decrypt } from "../utility-functions";

// Styled components
const StyledPaper = styled(Paper)(({theme}) => ({
    padding: "30px",
    borderRadius: "12px",
    backdropFilter: "blur(24px)",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: "#3a303d",
    boxShadow: theme.shadows[1],
    color: theme.palette.text.primary,
    fontFamily: "monospace",
}));

/* Interface for dataset file attributes from html page */
interface DatasetFile {
    key: string;
    links: { self: string };
    size: number;
    checksum: string;
}

/* Interface for dataset basic attributes from html page */
interface Dataset {
    id: string;
    title: string;
    metadata: { description: string };
    links: { self: string };
    files: DatasetFile[];
}

async function createDatabase(filePath: string, fileName: string) {
    try {
        const encryptedDatabaseSettings = localStorage.getItem("db_settings");
        if (!encryptedDatabaseSettings) {
            return;
        }
        const databaseSettings = await decrypt(encryptedDatabaseSettings);
        const data = {
            filePath: filePath,
            fileName: fileName,
            databaseSettings: JSON.parse(databaseSettings)
        };
        const response = await fetch(`http://localhost:8000/PutDatabase`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error running command:", error);
    }
}

/* Fetch available dataset info from posydon download page */
const DatasetList: React.FC = () => {
    const [expandedId, setExpandedId] = useState<string | undefined>();
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await fetch(
                    "https://zenodo.org/api/records/?communities=posydon&resource_type=dataset"
                );
                if (!response.ok) throw new Error("Failed to fetch datasets");

                const data = await response.json();
                setDatasets(data.hits.hits);
            } catch (error) {
                setError("Error fetching data" + error);
            } finally {
                setLoading(false);
            }
        };

        fetchDatasets();
    }, []);

    if (loading) return <p>Loading datasets...</p>;
    if (error) return <p>{error}</p>


    return (
        /* Background box and boxes for dataset + file info */

        <Box
            sx={{
                backgroundColor: "#2e2d2e",
                borderRadius: "15px",
                maxWidth: "lg",
                width: "100%",
                fontFamily: "monospace",
                paddingBottom: "4px"
            }}
        >
            <Box
                sx={{
                    fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', padding: '20px', textAlign: 'center'
                }}>
                Posydon Datasets Available
            </Box>

            {datasets.map((dataset) => {
                const isExpanded = expandedId === dataset.id;
                const description = dataset.metadata?.description || "No description";

                return (
                    <Box
                        key={dataset.id}
                        sx={{
                            marginBottom: "16px",
                            display: "flex",
                            flexDirection: "column",
                            paddingX: "20px",
                        }}
                    >
                        {/* Box for each dataset */}
                        <StyledPaper sx={{padding: "16px"}}>
                            <Typography variant="h5"
                                        sx={{
                                            marginBottom: "12px",
                                            color: "white",
                                            fontFamily: "monospace",
                                            textAlign: "left"
                                        }}>
                                {dataset.title}
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "10px"
                                }}
                            >
                                {/* Description Button */}
                                <Button
                                    variant="contained"
                                    onClick={() => setExpandedId(isExpanded ? undefined : dataset.id)}
                                    endIcon={isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                                    sx={{
                                        flex: 1,
                                        backgroundColor: "#5a50c7",
                                        fontFamily: "monospace",
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {isExpanded ? "HIDE DESCRIPTION" : "SHOW DESCRIPTION"}
                                </Button>

                                {/* Download Button */}
                                {dataset.files?.map((file) => (
                                    <>
                                        <Button
                                            variant="contained"
                                            onClick={() => window.open(file.links.self, "_blank")}
                                            endIcon={<DownloadIcon/>}
                                            sx={{
                                                flex: 1,
                                                backgroundColor: "#5a50c7",
                                                fontFamily: "monospace",
                                                fontWeight: "bold",
                                                color: "white",
                                            }}
                                        >
                                            <Tooltip
                                                title={
                                                    <>
                                                        <div><strong>Name:</strong> {file.key}</div>
                                                        <div><strong>Size:</strong> {(file.size / 1e9).toFixed(2)} GB
                                                        </div>
                                                    </>
                                                }
                                                arrow
                                                placement="bottom"
                                            >
                                                <span>DOWNLOAD</span>
                                            </Tooltip>
                                        </Button>

                                        <Button
                                            variant="contained"
                                            onClick={() => createDatabase(file.links.self, file.key)}
                                            endIcon={<UploadFile/>}
                                            sx={{
                                                flex: 1,
                                                backgroundColor: "#5a50c7",
                                                fontFamily: "monospace",
                                                color: "white",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            CREATE DATABASE USING DATASET
                                        </Button>
                                    </>
                                ))}
                            </Box>

                            {/* Collapse Wrapper */}
                            <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                            >

                                <StyledPaper
                                    sx={{
                                        backgroundColor: "#2e2d2e",
                                        mt: 2
                                    }}>
                                    <Typography
                                        component="div"
                                        sx={{
                                            color: "white",
                                            marginBottom: "8px",
                                            fontFamily: "monospace",
                                            padding: "12px",
                                            '& a': {
                                                color: '#ADD8E6', // Light blue
                                                textDecoration: 'underline',
                                            }
                                        }}
                                    >
                                        <div dangerouslySetInnerHTML={{__html: description}}/>
                                    </Typography>
                                </StyledPaper>
                            </Collapse>

                        </StyledPaper>
                    </Box>
                );
            })}
        </Box>
    );
};

export default DatasetList;

