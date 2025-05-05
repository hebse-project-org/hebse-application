import Box from "@mui/material/Box";
import {IconButton} from "@mui/material";
import {ArrowDropDownCircleRounded, Clear, ContentCopyOutlined} from "@mui/icons-material";
import {useState} from "react";

export const SavedQueriesComponent = ({savedQueries, setSavedQueries, setInputValue}: {
    savedQueries: Record<string, string>[],
    setSavedQueries: (value: ((previousState: Record<string, string>[]) => Record<string, string>[]) | Record<string, string>[]) => void,
    setInputValue: (value: (((previousState: string) => string) | string)) => void
}) => {
    const [displaySavedQueries, setDisplaySavedQueries] = useState<boolean>(false);

    function deleteQuery(queryName: string, queryValue: string) {
        const updatedQueries = savedQueries.filter(
            (item: Record<string, string>) => !(Object.keys(item)[0] === queryName && Object.values(item)[0] === queryValue)
        );
        localStorage.saved = JSON.stringify(updatedQueries);
        if (updatedQueries.length === 0) {
            setDisplaySavedQueries(false);
        }
        setSavedQueries(updatedQueries);
    }


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
            <Box sx={{fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', backgroundColor: '#2e2d2e', color: "#d7c8e8"}}>
                Saved Queries <IconButton sx={{maxHeight: "10px", width: "30px"}}
                    onClick={() => setDisplaySavedQueries(!displaySavedQueries)} children={<ArrowDropDownCircleRounded sx={{color:"white"}}/>}/>
            </Box>
            {displaySavedQueries ?
                savedQueries.map((item: Record<string, string>, index: number) => {
                    const queryName = Object.keys(item)[0];
                    const queryValue = item[queryName as keyof typeof item];
                    return (
                        <Box
                            sx={{
                                borderRadius: "8px",
                                border: "4px solid transparent",
                                textAlign: 'center',
                                maxWidth: "calc(100% - 24px)",
                                padding: '4px',
                                margin: '8px',
                                backgroundColor: '#3a303d',
                                textTransform: 'none',
                                fontFamily: 'monospace',
                                fontSize: "16px",
                                fontWeight: "light",
                                color: 'white',
                                display: "inline-flex",
                                alignItems: "center",
                                flexDirection: 'row-reverse'
                            }} key={index}>
                            <IconButton sx={{height: "10px", width: "30px", textAlign: "center"}}
                                        onClick={() => deleteQuery(queryName, queryValue)}><Clear
                                sx={{color: 'red', backgroundColor: "transparent"}}/></IconButton>
                            <IconButton sx={{marginLeft: "10px", height: "10px", width: "30px", textAlign: "center"}}
                                        onClick={() => setInputValue(queryValue)}><ContentCopyOutlined
                                sx={{color: '#1779e3', backgroundColor: "transparent"}}/></IconButton>
                            <Box flexGrow={1} component="div" sx={{
                                whiteSpace: 'normal',
                                overflowWrap: 'break-word',
                                textAlign: 'center',
                                width: "calc(100% - 60px)"
                            }}>{queryName}</Box>
                        </Box>
                    );
                }) : undefined}
        </Box>
    );
};