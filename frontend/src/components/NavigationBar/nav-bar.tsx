import {styled} from '@mui/material/styles';
import {useNavigate} from 'react-router-dom'; // Import useNavigate from React Router
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import {Build, Info, Search, Settings, Undo, } from "@mui/icons-material";
import BookIcon from '@mui/icons-material/Book';

const StyledToolbar = styled(Toolbar)(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    backdropFilter: 'blur(24px)',
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: "#2a1345",
    boxShadow: theme.shadows[1],
    padding: '8px 12px'
}));

const StyledButton = styled(Button)(() => ({
    marginRight: '8px',
    backgroundColor: "#1f034f",
    opacity: '100%',
    backdropFilter: 'blur(24px)',
    border: '2px solid',
    borderColor: 'darkgray',
    textTransform: 'none',
    maxHeight: '120%',
    fontFamily: 'monospace'
}))


export const NavBar = () => {
    const navigate = useNavigate(); // React Router navigation hook

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                mt: 'calc(var(--template-frame-height, 0px) + 28px)',
            }}
        >
            <Container maxWidth="lg">
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', px: 0, justifyContent: 'left'}}>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <StyledButton variant="contained" size="medium" startIcon={<Search/>}
                                          onClick={() => navigate("/")}>
                                Query
                            </StyledButton>
                            <StyledButton variant="contained" size="medium" startIcon={<Undo/>}
                                          onClick={() => navigate("/History")}>
                                History
                            </StyledButton>
                            <StyledButton variant="contained" size="medium" startIcon={<Build/>}
                                          onClick={() => navigate("/Utilities")}>
                                Utilities
                            </StyledButton>
                            <StyledButton variant="contained" size="medium" startIcon={<Settings/>}
                                          onClick={() => navigate("/Settings")}>
                                Settings
                            </StyledButton>
                            <StyledButton variant="contained" size="medium" startIcon={<BookIcon/>}
                                          onClick={() => navigate("/User_Manual")}>
                                User Manual
                            </StyledButton>
                            <StyledButton variant="contained" size="medium" startIcon={<Info/>}
                                          onClick={() => navigate("/About")}>
                                About
                            </StyledButton>
                        </Box>
                    </Box>
                    <Box component='section' sx={{
                        p: 1,
                        border: '5px inset #1f034f',
                        fontSize: '20px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        borderRadius: '15px'
                    }}>
                        HEBSE
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    );
};