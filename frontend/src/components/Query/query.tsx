import { useState } from 'react';
import { QueryInput } from "./QueryInput/query-input.tsx";
import { QueryResult } from './QueryResults/query-result.tsx';
import { QueryWelcomeText } from "../QueryWelcomeText/query-welcome-text.tsx";
import { SavedQueriesComponent } from "../SavedQueriesComponent/saved-queries-component.tsx";
import { Box } from "@mui/material";
import {NlpInteractions} from "./NLPInteraction/nlp-interactions.tsx";

export const Query = () => {
    const [pageNumber, setPageNumber] = useState(0);
    const [queryResult, setQueryResult] = useState('');
    const [savedQueries, setSavedQueries] = useState<Record<string, string>[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(50);

    return (
        <Box sx={{ display: "flex", justifyContent: "center", paddingTop: "20px"}}>
            <Box sx={{ 
                maxWidth: "1150px", 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px", 
                margin: "0 auto",
                paddingBottom: "16px"
            }}>
                {/* Centered Welcome Text */}
                <Box sx={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
                    <QueryWelcomeText />
                </Box>

                {/* NlpInteractions (Left) and QueryInput (Right) with Equal Sizes */}
                <Box 
                    sx={{ 
                        display: "flex", 
                        gap: "16px", 
                        alignItems: "stretch", 
                        flexWrap: "wrap"
                    }}
                >
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: "300px" }}>
                        <NlpInteractions />
                    </Box>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: "300px" }}>
                        <QueryInput 
                            onQueryResult={setQueryResult}
                            savedQueries={savedQueries}
                            setSavedQueries={setSavedQueries}
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            setPageNumber={setPageNumber}
                        />
                    </Box>
                </Box>
                <Box>
                    <SavedQueriesComponent 
                        savedQueries={savedQueries} 
                        setSavedQueries={setSavedQueries} 
                        setInputValue={setInputValue} 
                    />
                </Box>
                {/* QueryResults Spanning Full Width */}
                <Box>
                <QueryResult queryResult={queryResult.slice(pageNumber * rowsPerPage, pageNumber * rowsPerPage + rowsPerPage)}
                             setPageNumber={setPageNumber}
                             pageNumber={pageNumber}
                             totalEntries={queryResult.length}
                             rowsPerPage={rowsPerPage}
                             setRowsPerPage={setRowsPerPage}/>
 {/* Displays the query result passed from the parent state.*/}
                </Box>
            </Box>
                {/* <Box
                    sx={{
                        position: "fixed",
                        bottom: "0px",
                        left: "0px",
                        //transform: "translateX(-50%)",
                        backgroundColor: "rgba(0, 0, 0, 0)", // Translucent black
                        color: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        textAlign: "center",
                        fontSize: "10px"
                    }}
                >
                    Background image from Phil Brewer on <a href="https://app.astrobin.com/i/jfo1on">Astrobin</a>

                </Box> */}

        </Box>
    );
};