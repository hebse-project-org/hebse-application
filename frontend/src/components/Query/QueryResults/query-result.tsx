import { Box, IconButton } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { PageSelect } from "./PageSelect/page-select";
import "./query-result.css"

/* eslint-disable  @typescript-eslint/no-explicit-any*/
/* istanbul ignore file -- @preserve */
async function downloadData() {  
    try{
        const response = await fetch('http://localhost:8000/exportData')  
        if (!response.ok) throw new Error(`Server error: ${response.status}`);  
        const blob = await response.blob();  
        const url = globalThis.URL.createObjectURL(blob);  
        const link = document.createElement('a');  
        link.href = url;  
        link.download = "query_results.csv";  
        document.body.append(link);  
        link.click();  
        link.remove();  
        globalThis.URL.revokeObjectURL(url);  
    }
    catch(error){  
        console.error("Error downloading data:", error);  
    }
}

export const QueryResult = ({ queryResult, setPageNumber, pageNumber, totalEntries, rowsPerPage, setRowsPerPage }: { queryResult: any, setPageNumber: (value: (((previousState: number) => number) | number)) => void, pageNumber: number, totalEntries: number, rowsPerPage: number, setRowsPerPage: (value: (((previousState: number) => number) | number)) => void }) => {
    const renderResults = () => {
        if (!queryResult) {
            return "No results available.";
        }

        // If it's a string, render it directly
        if (typeof queryResult === 'string') {
            return queryResult;
        }

        // If it's an array, render it as a table
        if (Array.isArray(queryResult)) {
            if (queryResult.length === 0) {
                return "No data returned.";
            }

            // Ensure the first item is an object
            if (typeof queryResult[0] !== 'object' || queryResult[0] === null) {
                return "Unexpected data format.";
            }

            return (
                <Box sx={{ overflow: "auto", borderColor: "black", borderStyle: "solid", borderWidth: "2px", borderRadius:"10px"}}>
                    <table style={{width: '100%', padding: "5px"}}>
                        <thead>
                            <tr>
                                {Object.keys(queryResult[0]).map((key) => (
                                    <th
                                        key={key}
                                        style={{
                                            border: '1px solid white',
                                            padding: '8px',
                                            textAlign: 'left',
                                            backgroundColor: '#3a303d',
                                            color: 'white',
                                        }}
                                    >
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {queryResult.map((row: any, index: number) => (  
                                <tr key={index}>
                                    {Object.values(row).map((value, innerIndex) => (
                                        <td
                                            key={innerIndex}
                                            style={{
                                                border: '1px solid white',
                                                padding: '8px',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {value !== null && value !== undefined ? value.toString() : "N/A"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            );
        }

        // If it's an object, render key-value pairs
        if (typeof queryResult === "object") {
            return (
                <ul>
                    {Object.entries(queryResult).map(([key, value], index) => (
                        <li key={index}>
                            <strong>{key}:</strong> {value !== null && value !== undefined ? value.toString() : "N/A"}
                        </li>
                    ))}
                </ul>
            );
        }

        // Fallback for unknown data types
        return "Unsupported data type received.";
    };

    return (
        <Box
            component="div"
            sx={{
                backgroundColor: '#2e2d2e',
                flexGrow: 1,
                borderRadius: '15px',
                maxWidth: 'lg',
                fontFamily: 'monospace',
                marginTop: '20px',
                padding: '20px',
                color: 'white',
                textAlign: "center",
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' }}}>
                <Box sx={{ marginTop: '10px',fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', position: 'absolute', left: '50%', transform: 'translateX(-50%)', color: "#d7c8e8"}}>Query Results <IconButton children = {<DownloadIcon/>} sx={{color: 'white' }} onClick={() => downloadData()}/></Box>
                <Box sx={{ marginLeft: 'auto', marginTop: { xs: '50px', lg: '0' }}}>
                    <PageSelect setPageNumber={setPageNumber}
                        pageNumber={pageNumber}
                        rows={totalEntries}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}/>
                </Box>
            </Box>
            <Box sx={{ fontSize: '16px', marginTop: '10px' }}>
                {renderResults()}
            </Box>
        </Box>
    );
};
