import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // Import Router only once
import App from './app/routes'; // Ensure this matches your actual file path
import { NavBar } from './components/NavigationBar/nav-bar.tsx'; // Import NavBar
import './index.css';
import { enableTunnel, decrypt } from './components/Utilities/utility-functions.ts'; // Import enableTunnel function

const databaseSettings = localStorage.getItem("db_settings");
if (databaseSettings) {
  try {
    const decrypted = await decrypt(databaseSettings);
    enableTunnel(JSON.parse(decrypted)["isBackendRemote"] || false);
  } catch (error) {
    console.error("Failed to decrypt db_settings:", error);
  }
}

/* eslint-disable unicorn/prefer-query-selector*/
/* istanbul ignore file -- @preserve */
createRoot(document.getElementById('root')!).render(
    <Router>
        <NavBar /> {/* Ensure NavBar is always visible */}
        <App /> {/*Load all defined routes */}
    </Router>
);
