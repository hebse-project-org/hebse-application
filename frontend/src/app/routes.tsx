import {Route, Routes} from 'react-router-dom';
import {ErrorPage} from "../components/ErrorPage/error-page.tsx";
import {Query} from "../components/Query/query.tsx";
import {Utilities} from "../components/Utilities/utilities.tsx";
import {About} from "../components/About/about.tsx";
import {Settings} from "../components/Settings/settings.tsx";
import {History} from "../components/History/history.tsx";
import {UserManual} from "../components/UserManual/user-manual.tsx";
import {createTheme, ThemeProvider, CssBaseline, GlobalStyles} from "@mui/material";
import backgroundImage from '../assets/app_background.png';
/* istanbul ignore file -- @preserve */

const theme = createTheme({
    palette: {
        primary: {
            main: "#ffffff",
        },
        secondary: {
            main: "#ffffff",
        },
        background: {
            default: "#ffffff",
        },
        text: {
            primary: "#ffffff",
        },
    },
    typography: {
        fontFamily: "monospace",
        h1: {
            fontSize: "2.5rem",
            fontWeight: 600,
        },
        button: {
            textTransform: "none", // Prevent uppercase transformation
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "12px", // Custom border radius for buttons
                },
            },
        },
    },
});


const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
                styles={{
                    body: {
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundAttachment: 'fixed',
                        minHeight: '100vh',
                        margin: 0,
                    },
                }}
            />
            <Routes>
                <Route path='/' element={<Query/>}/>
                <Route path='/Settings' element={<Settings/>}/>
                <Route path='/History' element={<History/>}/>
                <Route path='/Utilities' element={<Utilities/>}/>
                <Route path='/About' element={<About/>}/>
                <Route path='/User_Manual' element={<UserManual/>}/>
                <Route path='*' element={<ErrorPage/>}/>
            </Routes>
        </ThemeProvider>

    )
};

export default App;
