
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DatabaseSetup from "../../../components/Settings/DatabaseSetup/database-setup";
import { vi } from "vitest";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import "@testing-library/jest-dom";
import * as utility from "../../../components/Utilities/utility-functions";

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

vi.mock("../../../components/Utilities/utility-functions.ts", () => ({
  encrypt: vi.fn((input) => Promise.resolve(`encrypted(${input})`)),
  decrypt: vi.fn((input) => Promise.resolve(input)),
  enableTunnel: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("alert", vi.fn());
  localStorage.clear();
});

describe("DatabaseSetup", () => {
  it("renders default UI", async () => {
    render(<DatabaseSetup />);
    expect(await screen.findByText(/Database Connection Setup/i)).toBeInTheDocument();
  });

  it("resets to an empty object when db_list decrypts to an array", async () => {
    // Arrange: store a JSON array in localStorage
    const arrayJson = JSON.stringify([{ foo: "bar" }]);
    localStorage.setItem("db_list", arrayJson);
  
    // Stub decrypt so it returns that same array string
    vi.mocked(utility.decrypt).mockResolvedValueOnce(arrayJson);
  
    // Act: render the component
    render(<DatabaseSetup />);
  
    // Assert: wait for decrypt to have been called with the array
    await waitFor(() => {
      expect(utility.decrypt).toHaveBeenCalledWith(arrayJson);
    });
  
    // Since loadAllDatabaseConfigs returned {}, your dropdown should
    // only contain the "Add New Database" option, and no "foo" profile
    fireEvent.mouseDown(screen.getByRole("combobox"));
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /Add New Database/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: /foo/i })
      ).not.toBeInTheDocument();
    });
  });

  it("loads and saves a full profile", async () => {
    render(<DatabaseSetup />);
    fireEvent.change(screen.getByLabelText("Profile Name"), { target: { value: "dev" } });
    fireEvent.change(screen.getByLabelText("Database Name"), { target: { value: "db" } });
    fireEvent.click(screen.getByText(/SAVE DATABASE SETTINGS/i));
    await waitFor(() => expect(localStorage.getItem("db_list")).toContain("encrypted"));
    expect(localStorage.getItem("db_settings")).toContain("encrypted");
  });

  it("alerts when profile name is missing", async () => {
    render(<DatabaseSetup />);
    fireEvent.change(screen.getByLabelText("Database Name"), { target: { value: "db" } });
    fireEvent.click(screen.getByText(/SAVE DATABASE SETTINGS/i));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Please enter a Profile Name before saving."));
  });

  it("alerts when database name is missing", async () => {
    render(<DatabaseSetup />);
    fireEvent.change(screen.getByLabelText("Profile Name"), { target: { value: "dev" } });
    fireEvent.click(screen.getByText(/SAVE DATABASE SETTINGS/i));
    await waitFor(() => expect(alert).toHaveBeenCalledWith("Please enter a valid DB Name before saving."));
  });

  it("toggles remote and backend remote switches", async () => {
    render(<DatabaseSetup />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Remote Database/i }));
    const backend = await screen.findByRole("checkbox", { name: /Remote Backend/i });
    fireEvent.click(backend);
    expect(backend).toBeChecked();
  });

  it("shows SSH inputs and handles typing", async () => {
    render(<DatabaseSetup />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Remote Database/i }));
    fireEvent.change(await screen.findByLabelText("SSH Host"), { target: { value: "ssh" } });
    fireEvent.change(screen.getByLabelText("SSH Port"), { target: { value: "2222" } });
    fireEvent.change(screen.getByLabelText("SSH Username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("SSH Password"), { target: { value: "key" } });
    expect(screen.getByLabelText("SSH Password")).toHaveValue("key");
  });

  it("removes a profile and clears settings", async () => {
    const profileName = "prod";
    localStorage.setItem("db_list", "mockList");
    localStorage.setItem("db_settings", "mockSettings");
    vi.mocked(utility.decrypt).mockImplementation(async (x) => {
      if (x === "mockList") return JSON.stringify({ [profileName]: { databaseName: "db", databasePort: "5432", databaseHost: "", databasePassword: "", databaseUsername: "", isRemote: false, isBackendRemote: false, sshHost: "", sshPort: "22", sshUser: "", sshKey: "" } });
      if (x === "mockSettings") return JSON.stringify({ profileName });
      return x;
    });
    render(<DatabaseSetup />);
    fireEvent.change(screen.getByLabelText("Profile Name"), { target: { value: profileName } });
    fireEvent.change(screen.getByLabelText("Database Name"), { target: { value: "db" } });
    fireEvent.click(await screen.findByRole("button", { name: /REMOVE DATABASE/i }));
    await waitFor(() => expect(alert).toHaveBeenCalledWith(expect.stringContaining("removed")));
  });

  it("does not remove profile if key is empty or 'new'", async () => {
    render(<DatabaseSetup />);
    fireEvent.change(screen.getByLabelText("Profile Name"), { target: { value: "new" } });
    expect(screen.queryByRole("button", { name: /REMOVE DATABASE/i })).not.toBeInTheDocument();
  });

  it('toggles password key visibility when clicking the visibility icon', () => {
    renderWithTheme(<DatabaseSetup />);
    const passwordInput = screen.getByLabelText("Database Password", { selector: 'input' }) as HTMLInputElement;

    // starts hidden
    expect(passwordInput.getAttribute('type')).toBe('password');

    // the little icon‐button has no accessible name, so it shows up as a button with name=""
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);

    // now it should be visible
    expect(passwordInput.getAttribute('type')).toBe('text');

    // click again to hide
    fireEvent.click(toggleButton);
    expect(passwordInput.getAttribute('type')).toBe('password');
  });

  it("toggles SSH-Password field between password & text when you click the visibility icon", () => {
    renderWithTheme(<DatabaseSetup />);
    // 1) Turn on remote-DB
    const remoteToggle = screen.getByRole("checkbox", {
      name: /remote database/i,
    });
    fireEvent.click(remoteToggle);
  
    const sshInput = screen.getByLabelText("Database Password", { selector: 'input' }) as HTMLInputElement;

    // starts hidden
    expect(sshInput.getAttribute('type')).toBe('password');

    // the little icon‐button has no accessible name, so it shows up as a button with name=""
    const toggleButton = screen.getAllByRole('button', { name: '' });
    
    fireEvent.click(toggleButton[1]);

    // now it should be visible
    expect(sshInput.getAttribute('type')).toBe('text');

    // click again to hide
    fireEvent.click(toggleButton[1]);
    expect(sshInput.getAttribute('type')).toBe('password');
  });

  it("handles invalid db_list JSON", async () => {
    vi.mocked(utility.decrypt).mockResolvedValueOnce("not-json");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("db_list", "bad");
    render(<DatabaseSetup />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Error parsing db_list:", expect.anything()));
    spy.mockRestore();
  });

  it("handles invalid db_settings JSON", async () => {
    vi.mocked(utility.decrypt).mockResolvedValueOnce("not-json");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem("db_settings", "bad");
    render(<DatabaseSetup />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.stringContaining("Error loading last‑used settings:"), expect.anything()));
    spy.mockRestore();
  });

  it("covers toggleRemote branch when disabling remote", async () => {
    render(<DatabaseSetup />);
    const remoteToggle = screen.getByRole("checkbox", { name: /Remote Database/i });
    fireEvent.click(remoteToggle); // on
    const backendToggle = await screen.findByRole("checkbox", { name: /Remote Backend/i });
    fireEvent.click(backendToggle); // on
    fireEvent.click(remoteToggle); // off → resets backend
    fireEvent.click(remoteToggle); // on
    expect(await screen.findByRole("checkbox", { name: /Remote Backend/i })).not.toBeChecked();
  });

  it("clears fields when selecting 'new' from the dropdown", async () => {
    render(<DatabaseSetup />);
  
    // Select 'new' from dropdown
    fireEvent.mouseDown(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: /Add New Database/i });
    fireEvent.click(option);
  
    // Enable remote so SSH fields show up
    fireEvent.click(screen.getByRole("checkbox", { name: /Remote Database/i }));


    await waitFor(() => { 
      // All key fields should be cleared
      expect(screen.getByLabelText("Profile Name")).toHaveValue("");
      expect(screen.getByLabelText("Database Port")).toHaveValue(5432);
      expect(screen.getByLabelText("SSH Port")).toHaveValue(22); // ensures sshPort default logic hits
    });
  });

  it("loads fields when selecting an existing profile", async () => {
    const profileKey = "test";
  
    vi.mocked(utility.decrypt).mockImplementation(async (value) => {
      if (value === "mock") {
        return JSON.stringify({
          [profileKey]: {
            databaseHost: "host",
            databasePort: "5432",
            databaseUsername: "user",
            databasePassword: "pass",
            databaseName: "db",
            isRemote: true,
            isBackendRemote: false,
          },
        });
      }
      return "{}"; // fallback for db_settings
    });
  
    localStorage.setItem("db_list", "mock");
  
    render(<DatabaseSetup />); // 
  
    // Open dropdown and select the profile
    fireEvent.mouseDown(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: profileKey });
    fireEvent.click(option);
  
    // Enable remote toggle so SSH fields appear
    fireEvent.click(screen.getByRole("checkbox", { name: /Remote Database/i }));
  
    // Assert that fields are updated
    await waitFor(() => {
      expect(screen.getByLabelText("Database Host")).toHaveValue("host");
    });
  });

  it("renders and interacts with all local DB fields", async () => {
    render(<DatabaseSetup />);
  
    const hostInput = screen.getByLabelText("Database Host");
    const portInput = screen.getByLabelText("Database Port");
    const userInput = screen.getByLabelText("Database Username");
    const passInput = screen.getByLabelText("Database Password", { selector: "input" });
  
    fireEvent.change(hostInput, { target: { value: "localhost" } });
    fireEvent.change(portInput, { target: { value: "6543" } });
    fireEvent.change(userInput, { target: { value: "admin" } });
    fireEvent.change(passInput, { target: { value: "secret" } });
  
    expect(hostInput).toHaveValue("localhost");
    expect(portInput).toHaveValue(6543);
    expect(userInput).toHaveValue("admin");
    expect(passInput).toHaveValue("secret");
  });

  it("clears and deletes 'new' profile when typing 'new' as profile name", async () => {
    const encryptedDatabaseListKey = "mock";
  
    // 1. Set up a localStorage value for db_list that will trigger decrypt("mock")
    localStorage.setItem("db_list", encryptedDatabaseListKey);
  
    // 2. Make decrypt return a profile with "new"
    vi.mocked(utility.decrypt).mockImplementation(async (value) => {
      if (value === encryptedDatabaseListKey) {
        return JSON.stringify({
          new: {
            databaseHost: "localhost",
            databasePort: "5432",
            databaseUsername: "user",
            databasePassword: "pass",
            databaseName: "db",
            isRemote: false,
            isBackendRemote: false,
            sshHost: "",
            sshPort: "22",
            sshUser: "",
            sshKey: ""
          }
        });
      }
      return "{}";
    });
  
    // 3. Spy on encrypt to verify it was called
    const encryptSpy = vi
      .mocked(utility.encrypt)
      .mockImplementation(async (input) => input); // echo input for inspection
  
    // 4. Stub alert to prevent popup and verify message
    const alertSpy = vi.fn();
    vi.stubGlobal("alert", alertSpy);
  
    render(<DatabaseSetup />);
  
    // 5. Type "new" into the Profile Name field
    fireEvent.change(screen.getByLabelText("Profile Name"), {
      target: { value: "new" }
    });
  
    // 6. Wait for logic to finish
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "“new” is a reserved keyword and cannot be used as a profile name."
      );
      expect(encryptSpy).toHaveBeenCalledTimes(1);
      expect(encryptSpy.mock.calls[0][0]).toBe(JSON.stringify({})); // confirms "new" was deleted
      expect(localStorage.getItem("db_list")).toBe(JSON.stringify({}));
    });
  });

  it("logs an error if db_settings is not decryptable", async () => {
    const profileKey = "toDelete";
  
    const profile = {
      databaseHost: "localhost",
      databasePort: "5432",
      databaseUsername: "user",
      databasePassword: "pass",
      databaseName: "mydb",
      isRemote: false,
      isBackendRemote: false,
      sshHost: "",
      sshPort: "22",
      sshUser: "",
      sshKey: "",
      profileName: profileKey,
    };
  
    const encryptedList = "mockEncryptedList";
    const encryptedSettings = "mockEncryptedSettings";
  
    localStorage.setItem("db_list", JSON.stringify({ [profileKey]: profile }));
    localStorage.setItem("db_settings", encryptedSettings);
  
    vi.mocked(utility.decrypt).mockImplementation(async (value) => {
      if (value === encryptedSettings) throw new Error("decryption failed");
      return JSON.stringify({ [profileKey]: profile });
    });
  
    vi.mocked(utility.encrypt).mockResolvedValue(encryptedList);
  
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  
    render(<DatabaseSetup />);
  
    // Select the profile
    const dropdown = screen.getByRole("combobox");
    fireEvent.mouseDown(dropdown);
    const option = await screen.findByText(profileKey);
    fireEvent.click(option);
  
    // Wait for render
    await screen.findByDisplayValue(profileKey);
  
    // Trigger removal
    const removeButton = screen.getByRole("button", { name: /save database settings/i });
    fireEvent.click(removeButton); // triggers validation
    const removeReal = screen.getByRole("button", { name: /remove database/i });
    fireEvent.click(removeReal);
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error clearing last-used database:"),
        expect.any(Error)
      );
    });
  
    consoleSpy.mockRestore();
  });
  
  it("executes both decrypts and hits the `parsed.profileName || \"\"` line (136)", async () => {
    // 1) arrange two ciphers in localStorage
    const LIST_CIPHER     = "CIPHER_LIST";
    const SETTINGS_CIPHER = "CIPHER_SETTINGS";
    localStorage.setItem("db_list",     LIST_CIPHER);
    localStorage.setItem("db_settings", SETTINGS_CIPHER);
  
    // 2) prepare fake values
    const fakeSettings = {
      profileName:      "theOne",
      databaseHost:     "h1",
      databasePort:     "1111",
      databaseUsername: "u1",
      databasePassword: "p1",
      databaseName:     "db1",
      isRemote:         false,
      isBackendRemote:  false,
      sshHost:          "",
      sshPort:          "",
      sshUser:          "",
      sshKey:           "",
    };
    const fakeList = { theOne: fakeSettings };
  
    // 3) stub decrypt *twice* in the right order
    vi.spyOn(utility, "decrypt")
      .mockResolvedValueOnce(JSON.stringify(fakeList))       // for loadAllDatabaseConfigs()
      .mockResolvedValueOnce(JSON.stringify(fakeSettings));  // for the db_settings IIFE
  
    // 4) render
    renderWithTheme(<DatabaseSetup />);
  
    // 5) wait for both decrypt calls
    await waitFor(() => {
      expect(utility.decrypt).toHaveBeenCalledWith(LIST_CIPHER);
      expect(utility.decrypt).toHaveBeenCalledWith(SETTINGS_CIPHER);
      expect(utility.decrypt).toHaveBeenCalledTimes(2);
    });
  
    // 6) now the second IIFE is definitely past the `parsed.profileName || ""` line,
    //    and should have called setProfileName("theOne"), which renders into your UI.
    //    Use whatever query matches your Profile‐Name field:
    const profileNameInput = await screen.findByLabelText("Profile Name", {
      selector: "input",
    });
    expect(profileNameInput).toHaveValue("theOne");
  
    // (Optionally poke the dropdown to confirm your one profile is present:)
    fireEvent.mouseDown(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: /theOne/i })).toBeInTheDocument();
  });

  it("defaults lastProfileKey to empty when profileName is missing", async () => {
    // Arrange
    localStorage.setItem("db_list",     "CIPHER_LIST");
    localStorage.setItem("db_settings", "CIPHER_SETTINGS");
    // first call (list) → empty object, second call (settings) → object *without* profileName
    vi.spyOn(utility, "decrypt")
      .mockResolvedValueOnce(JSON.stringify({}))                        // loadAllDatabaseConfigs()
      .mockResolvedValueOnce(JSON.stringify({
        /* no profileName here! */
        databaseHost: "h1",
        databasePort: "5432",
        /* …other required props… */
      }));
  
    // Act
    renderWithTheme(<DatabaseSetup />);
  
    // Assert: Profile Name input should end up empty
    const input = await screen.findByLabelText("Profile Name", { selector: "input" });
    expect(input).toHaveValue("");    // ← covers the `""` branch
  });

  it("covers false branch when db_settings profile does not match selected key", async () => {
    const selectedKey = "foo";
    const lastUsedKey = "bar";
  
    const mockProfile = {
      databaseName: "mydb",
      databasePort: "5432",
      databaseHost: "",
      databasePassword: "",
      databaseUsername: "",
      isRemote: false,
      isBackendRemote: false,
      sshHost: "",
      sshPort: "22",
      sshUser: "",
      sshKey: ""
    };
  
    // Setup decrypt to return matching list but mismatched settings
    vi.mocked(utility.decrypt).mockImplementation(async (value) => {
      if (value === "mockList") {
        return JSON.stringify({ [selectedKey]: mockProfile });
      }
      if (value === "mockSettings") {
        return JSON.stringify({ profileName: lastUsedKey }); // ← mismatch
      }
      return value;
    });
  
    localStorage.setItem("db_list", "mockList");
    localStorage.setItem("db_settings", "mockSettings");
  
    const spy = vi.spyOn(localStorage.__proto__, "removeItem");
  
    render(<DatabaseSetup />);
  
    // Open the dropdown and select the real key
    fireEvent.mouseDown(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: selectedKey });
    fireEvent.click(option);
  
    // Fire the remove button
    const removeButton = await screen.findByRole("button", { name: /remove database/i });
    fireEvent.click(removeButton);
  
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalledWith("db_settings");
    });
  
    spy.mockRestore();
  });

  it("skips clearing db_settings if lastUsed is null", async () => {
  const selectedKey = "foo";

  // Simulate no db_settings
  localStorage.removeItem("db_settings");

  const mockProfile = {
    databaseName: "mydb",
    databasePort: "5432",
    databaseHost: "",
    databasePassword: "",
    databaseUsername: "",
    isRemote: false,
    isBackendRemote: false,
    sshHost: "",
    sshPort: "22",
    sshUser: "",
    sshKey: ""
  };

  vi.mocked(utility.decrypt).mockResolvedValueOnce(JSON.stringify({ [selectedKey]: mockProfile }));

  localStorage.setItem("db_list", "mockList");

  const spy = vi.spyOn(localStorage.__proto__, "removeItem");

  render(<DatabaseSetup />);

  // Select the real profile so it sets selectedProfileKey
  fireEvent.mouseDown(screen.getByRole("combobox"));
  const option = await screen.findByRole("option", { name: selectedKey });
  fireEvent.click(option);

  // Click REMOVE
  const removeButton = await screen.findByRole("button", { name: /remove database/i });
  fireEvent.click(removeButton);

  await waitFor(() => {
    // db_settings was never removed because it didn't exist
    expect(spy).not.toHaveBeenCalledWith("db_settings");
  });

  spy.mockRestore();
});

});
