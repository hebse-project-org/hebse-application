import Box from "@mui/material/Box";

export const QueryWelcomeText = () => {
  return (
      <Box
          sx={{
              backgroundColor: "#2e2d2e",
              borderRadius: "15px",
              maxWidth: "lg",
              width: "100%",
              fontFamily: "monospace",
              padding: "20px",
              marginTop:"100px",
              textAlign: "center",
          }}
      >
          <Box sx={{fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', color: "#d7c8e8"
          }}>
              Welcome to HEBSE!
          </Box>
          <Box sx={{fontSize: '20px',}}>
          This interactive application is designed to help you query and explore datasets representing the evolution of binary star systems. 
          Whether you are an astrophysics researcher, student or just a space enthusiast, HEBSE enables you to pose queries with an ease of LLM-based natural language interface, 
          while guaranteeing the consistency of robust database query processing. The data is obtained from the publicly available
           POSYDON project (
            <a href="https://posydon.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>https://posydon.org/</a>) 
            and, as part of its functionality, HEBSE enables you to use updated versions of the data.
          </Box>
      </Box>
  )
}