import Box from "@mui/material/Box";

export const About = () => {
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
                }}
            >
                <Box
                    sx={{
                        paddingTop: "120px",
                        backgroundColor: "#2e2d2e",
                        borderRadius: "15px",
                        width: "1150px",
                        fontFamily: "monospace",
                        padding: "20px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        justifyContent: "flex-start",
                    }}
                >
                    <Box sx={{ fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'center', color: "#d7c8e8" }}>
                        About Us
                    </Box>
                    <Box sx={{ fontSize: '19px' }}>
                    The development of HEBSE is a result of a two semesters work on a Senior Design project by an interdisciplinary team of Computer, Software, and Cyber Security Engineers from Iowa State University. The process involved all the rigor of identifying requirements (functional, non-functional, etc.), consulting literature, analyzing different design choices and selecting from available tools/technologies. The agile approach to implementation was accompanied by detailed and thorough testing. HABSE is made available for public use “as is”, with no warranty and commitment for technical support. However, we have created a comprehensive document detailing not only the evolution of the project and the different testing methods used, but also containing a user manual explaining the installation and possible updates. To obtain the documentation, as well to learn more about the individual members of the team, all of whom are passionate about developing technological solutions to challenging application domains, please access:  <a href="https://sdmay25-20.sd.ece.iastate.edu/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>https://sdmay25-20.sd.ece.iastate.edu/</a>.
                    </Box>
                    <Box sx={{ fontSize: '19px' }}>
                    
                    </Box>
                    <Box sx={{ fontSize: '10px' }}>
                    Background image from Phil Brewer on <a href="https://app.astrobin.com/i/jfo1on">Astrobin</a>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};