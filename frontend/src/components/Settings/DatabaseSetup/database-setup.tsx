import { useEffect, useState } from "react";
// Styled Select for a consistent gray/white look
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  Typography
} from "@mui/material";
import {styled } from "@mui/material/styles";
import { DeleteForever, Save, Visibility, VisibilityOff } from "@mui/icons-material";
import HelpTextField from "../../HelpTextField/help-text-field.tsx";
import { enableTunnel, encrypt, decrypt } from "../../Utilities/utility-functions.ts";

type DatabaseConfig = {
  databaseHost: string;
  databasePort: string;
  databaseUsername: string;
  databasePassword: string;
  databaseName: string;
  isRemote: boolean;
  isBackendRemote: boolean;
  sshHost: string;
  sshPort: string;
  sshUser: string;
  sshKey: string;
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: "30px",
  borderRadius: "12px",
  backdropFilter: "blur(24px)",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: "#2e2d2e",
  boxShadow: theme.shadows[1],
  fontFamily: "monospace",
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  marginBottom: "15px",
  backgroundColor: "#2e2d2e",
  color: "white",
  borderRadius: "5px",
  fontFamily: "monospace",

  // Ensure the dropdown arrow is also white
  "& .MuiSvgIcon-root": {
    color: "white",
  },

  // Outline styling
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

// --------------------------------------------------
// Helper: Load all DB configs from localStorage
// --------------------------------------------------
const loadAllDatabaseConfigs = async (): Promise<Record<string, DatabaseConfig>> => {
  const stored = localStorage.getItem("db_list");
  if (stored) {
    try {
      const plain  = await decrypt(stored);
      const parsed = JSON.parse(plain);
      // If it's not an object (e.g., an old array), reset
      return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } 
    catch (error) {
      console.error("Error parsing db_list:", error);
    }
  }
  return {};
};

const DatabaseSetup = () => {
  // List of saved profile names for the dropdown
  const [profileNames, setProfileNames] = useState<string[]>([]);

  // The currently loaded/selected profile from the dropdown
  const [selectedProfileKey, setSelectedProfileKey] = useState("");

  // A separate text field to name/rename the profile
  const [profileName, setProfileName] = useState("");

  // DB connection fields
  const [databaseHost, setDatabaseHost] = useState("");
  const [databasePort, setDatabasePort] = useState("5432");
  const [databaseUsername, setDatabaseUsername] = useState("");
  const [databasePassword, setDatabasePassword] = useState("");
  const [databaseName, setDatabaseName] = useState("");

  // Whether this DB uses a remote (SSH) connection
  const [isRemote, setIsRemote] = useState(false);
  const [isBackendRemote, setIsBackendRemote] = useState(false);

  // SSH fields (for remote mode)
  const [sshHost, setSshHost] = useState("");
  const [sshPort, setSshPort] = useState("22");
  const [sshUser, setSshUser] = useState("");
  const [sshKey, setSshKey] = useState("");

  // Toggle DB password visibility
  const [showPassword, setShowPassword] = useState(false);

  // --------------------------------------------------
  // Load profiles on mount + last-used config
  // --------------------------------------------------
  useEffect(() => {
    (async () => {                            
      const allProfiles = await loadAllDatabaseConfigs();   // await
      setProfileNames(Object.keys(allProfiles));
    })();
  
    (async () => {                                       
      const enc = localStorage.getItem("db_settings");
      if (!enc) return;
  
      try {
        const plain  = await decrypt(enc);               // decrypt first
        const parsed = JSON.parse(plain);                // then parse
  
        // The key that was last used
        const lastProfileKey = parsed.profileName || "";
        setSelectedProfileKey(lastProfileKey);
        setProfileName(lastProfileKey);
  
        // Fill in DB fields
        setDatabaseHost(parsed.databaseHost || "");
        setDatabasePort(parsed.databasePort || "5432");
        setDatabaseUsername(parsed.databaseUsername || "");
        setDatabasePassword(parsed.databasePassword || "");
        setDatabaseName(parsed.databaseName || "");
        setIsRemote(!!parsed.isRemote);
        setIsBackendRemote(!!parsed.isBackendRemote);
  
        // Fill in SSH if remote
        setSshHost(parsed.sshHost || "");
        setSshPort(parsed.sshPort || "22");
        setSshUser(parsed.sshUser || "");
        setSshKey(parsed.sshKey || "");
      } catch (error) {
        console.error("Error loading last‑used settings:", error);
      }
    })();
  }, []);

  // --------------------------------------------------
  // When user picks an existing profile from the dropdown
  // --------------------------------------------------
  const handleProfileSelect = async (event: SelectChangeEvent<unknown>) => {
    const chosenKey = event.target.value as string;
    setSelectedProfileKey(chosenKey);

    if (chosenKey === "new") {
      // Clear fields for brand-new
      setProfileName("");
      setDatabaseHost("");
      setDatabasePort("5432");
      setDatabaseUsername("");
      setDatabasePassword("");
      setDatabaseName("");
      setIsRemote(false);
      setIsBackendRemote(false);
      setSshHost("");
      setSshPort("22");
      setSshUser("");
      setSshKey("");
      return;
    }

    const allProfiles = await loadAllDatabaseConfigs();
    const cfg = allProfiles[chosenKey];
    if (cfg) {
      // Put the chosenKey in the Profile Name text field so the user can rename if they want
      setProfileName(chosenKey);

      setDatabaseHost(cfg.databaseHost);
      setDatabasePort(cfg.databasePort);
      setDatabaseUsername(cfg.databaseUsername);
      setDatabasePassword(cfg.databasePassword);
      setDatabaseName(cfg.databaseName);
      setIsRemote(cfg.isRemote);
      setIsBackendRemote(cfg.isBackendRemote);

      setSshHost(cfg.sshHost || "");
      setSshPort(cfg.sshPort || "22");
      setSshUser(cfg.sshUser || "");
      setSshKey(cfg.sshKey || "");
    }
  };

  // --------------------------------------------------
  // Save the current config
  // --------------------------------------------------
  const handleSave = async () => {
    // 1) Must have a profileName
    if (!profileName.trim()) {
      alert("Please enter a Profile Name before saving.");
      return;
    }
    // 2) Must have a DB name
    if (!databaseName.trim()) {
      alert("Please enter a valid DB Name before saving.");
      return;
    }

    // Load + update localStorage
    const allProfiles = await loadAllDatabaseConfigs(); //await the promise, happens at every function call to loadAllDatabaseConfigs to allow encrypting an decrypting.

    // Overwrite/create the profile
    allProfiles[profileName] = {
      databaseHost,
      databasePort,
      databaseUsername,
      databasePassword,
      databaseName,
      isRemote,
      isBackendRemote,
      sshHost,
      sshPort,
      sshUser,
      sshKey,
    };

    const encryptedDatabaseList = await encrypt(JSON.stringify(allProfiles));
    localStorage.setItem("db_list", encryptedDatabaseList);

    // Also store this as last-used in db_settings
    const plainText = JSON.stringify({
      profileName,
      databaseHost,
      databasePort,
      databaseUsername,
      databasePassword,
      databaseName,
      isRemote,
      isBackendRemote,
      sshHost,
      sshPort,
      sshUser,
      sshKey,
    });

    const encrypted = await encrypt(plainText);           // encrypt
    localStorage.setItem("db_settings", encrypted);       // store ciphertext
    enableTunnel(isBackendRemote)
    
    // Refresh
    setProfileNames(Object.keys(allProfiles));
    setSelectedProfileKey(profileName);
    alert("Database settings saved!");
  };

  // --------------------------------------------------
  // Remove current profile
  // --------------------------------------------------
  const handleRemove = async() => {
    // Redundant and never reached
    // if (!selectedProfileKey || selectedProfileKey === "new") {
    //   return;
    // }
    const allProfiles = await loadAllDatabaseConfigs();

    // Remove it
    delete allProfiles[selectedProfileKey];
    const encList = await encrypt(JSON.stringify(allProfiles));
    localStorage.setItem("db_list", encList);

    // If that was lastUsed, clear
    const lastUsed = localStorage.getItem("db_settings");
    if (lastUsed) {
      try {
        const decrypted = await decrypt(lastUsed);
        const parsed = JSON.parse(decrypted);
        if (parsed.profileName === selectedProfileKey) {
          localStorage.removeItem("db_settings");
        }
      } catch (error) {
        console.error("Error clearing last-used database:", error);
      }
    }

    // Clear out local
    setProfileNames(Object.keys(allProfiles));
    setSelectedProfileKey("");
    setProfileName("");
    setDatabaseHost("");
    setDatabasePort("5432");
    setDatabaseUsername("");
    setDatabasePassword("");
    setDatabaseName("");
    setIsRemote(false);
    setIsBackendRemote(false);
    setSshHost("");
    setSshPort("22");
    setSshUser("");
    setSshKey("");

    alert(`Database profile '${selectedProfileKey}' was removed!`);
  };

  // For toggling DB password visibility
  const passwordInputProperties = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
          {showPassword ? <VisibilityOff sx={{ color: "white" }} /> : <Visibility sx={{ color: "white" }} />}
        </IconButton>
      </InputAdornment>
    ),
  };

  function toggleRemote(toggle_option: boolean) {
    setIsRemote(toggle_option)
    setIsBackendRemote(toggle_option && isBackendRemote);
  }

  return (
    <Box sx={{ width: "100%" }}>
      <StyledPaper elevation={6}>
        <Typography
          variant="h4"
          sx={{
            fontSize: '25px', fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center', marginBottom: "20px", color: "#d7c8e8"
          }}
        >
          Database Connection Setup
        </Typography>

        {/* Load Existing Profile (Dropdown) */}
        <StyledSelect
          value={selectedProfileKey}
          onChange={handleProfileSelect}
          fullWidth
          variant="outlined"
            MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: "#3a303d",   // grey background
                    color:  "white",       // white item text
                  },
                },
              }}
          sx={{
            backgroundColor: "#3a303d",
            fontFamily: "monospace",
            fontWeight: "bold",
            flex: 1,
            marginBottom: "20px", // extra space
          }}
        >
          {profileNames.map((pName) => (
            <MenuItem key={pName} value={pName}>
              {pName}
            </MenuItem>
          ))}
          <MenuItem value="new">Add New Database</MenuItem>
        </StyledSelect>

        <HelpTextField
  label="Profile Name"
  value={profileName}
  onChange={async (input) => {              //handler must be async for encryption and decryption to work properly.
    const value = input.target.value.trim();

    if (value.toLowerCase() === "new") {
      alert(`“new” is a reserved keyword and cannot be used as a profile name.`);

      // Clear the input field
      setProfileName("");

      // Delete the 'new' profile from localStorage if it somehow exists
      
      const allProfiles = await loadAllDatabaseConfigs();
      if (allProfiles["new"]) {
        delete allProfiles["new"];
        const encList = await encrypt(JSON.stringify(allProfiles)); 
        localStorage.setItem("db_list", encList);
      }

      return;
    }

    // If not reserved, allow normal input
    setProfileName(value);
  }}
  
  tooltipText="A unique label for this DB configuration."
/>

        {/* Remote Toggle */}
        <Box sx={{ marginBottom: "15px", marginTop: "15px" }}>
          <FormControlLabel
            control={
              <Switch
                checked={isRemote}
                onChange={(input) => toggleRemote(input.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'white',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'white',
                  },
                }}
              />
            }
            label="Remote Database (SSH)"
            sx={{ "& .MuiFormControlLabel-label": { fontFamily: "monospace", color: "white" } }}
          />
          { isRemote &&
            <FormControlLabel
              control={
                <Switch
                  checked={isBackendRemote}
                  onChange={(input) => {
                    setIsBackendRemote(input.target.checked);
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              }
              label="Remote Backend"
              sx={{ "& .MuiFormControlLabel-label": { fontFamily: "monospace", color: "white" } }}
            />
          }
        </Box>

        {/* Local DB Fields */}
        <HelpTextField
          label="Database Host"
          value={databaseHost}
          onChange={(input) => setDatabaseHost(input.target.value)}
          tooltipText="Enter the DB server hostname or IP (e.g. localhost)."
        />
        <HelpTextField
          label="Database Port"
          type="number"
          value={databasePort}
          onChange={(input) => setDatabasePort(input.target.value)}
          tooltipText="Enter the port number for the DB server (default: 5432)."
        />
        <HelpTextField
          label="Database Username"
          value={databaseUsername}
          onChange={(input) => setDatabaseUsername(input.target.value)}
          tooltipText="Enter the database username/account name."
        />
        <HelpTextField
          label="Database Password"
          type={showPassword ? "text" : "password"}
          value={databasePassword}
          onChange={(input) => setDatabasePassword(input.target.value)}
          tooltipText="Enter the database user’s password."
          // inputProps={passwordInputProperties}             deprecated
          slotProps={{input: passwordInputProperties}}
        />
        <HelpTextField
          label="Database Name"
          value={databaseName}
          onChange={(input) => setDatabaseName(input.target.value)}
          tooltipText="Enter the name of the database you want to connect to."
        />

        {/* SSH Fields if Remote */}
        {isRemote && (
          <>
            <Typography
              variant="h6"
              sx={{
                marginTop: "20px",
                marginBottom: "10px",
                fontFamily: "monospace",
                color: "white",
              }}
            >
              SSH Connection Details
            </Typography>
            <HelpTextField
              label="SSH Host"
              value={sshHost}
              onChange={(input) => setSshHost(input.target.value)}
              tooltipText="Enter the SSH server host (e.g., example.com)."
            />
            <HelpTextField
              label="SSH Port"
              type="number"
              value={sshPort}
              onChange={(input) => setSshPort(input.target.value)}
              tooltipText="SSH port (default 22)."
            />
            <HelpTextField
              label="SSH Username"
              value={sshUser}
              onChange={(input) => setSshUser(input.target.value)}
              tooltipText="Your SSH username on the remote host."
            />
            <HelpTextField
              label="SSH Password"
              type={showPassword ? "text" : "password"}
              value={sshKey}
              onChange={(input) => setSshKey(input.target.value)}
              tooltipText="Paste your SSH private key here, or an SSH password if not using keys."
              // inputProps={{ multiline: true, rows: 4, style: { color: "white" }, passwordInputProperties }} deprecated, fixed visibility
              slotProps={{input: passwordInputProperties}}
              
            />
          </>
        )}

        {/* Save / Remove Buttons */}
        <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#0b9e26",
              fontFamily: "monospace",
              fontWeight: "bold",
              color: "white",
              flex: 1,
            }}
            onClick={handleSave}
            startIcon={<Save />}
          >
            SAVE DATABASE SETTINGS
          </Button>

          {selectedProfileKey && selectedProfileKey !== "new" && (
            <Button
              variant="contained"
              color="error"
              sx={{
                fontFamily: "monospace",
                fontWeight: "bold",
                color: "white",
                flex: 1,
              }}
              onClick={handleRemove}
              startIcon={<DeleteForever />}
            >
              REMOVE DATABASE
            </Button>
          )}
        </Box>
      </StyledPaper>
    </Box>
  );
};

export default DatabaseSetup;
