import {beforeEach, describe, expect, it, vi} from "vitest";
import {decrypt, enableTunnel, encrypt} from "../../components/Utilities/utility-functions.ts";
import * as UtilityFunctions from  "../../components/Utilities/utility-functions.ts";

describe("enableTunnel", () => {
    beforeEach(() => {
        vi.restoreAllMocks();

        const fakeSettings = {
            databaseHost: "fake-db-host",
            sshHost: "fake-ssh-host",
            sshPort: 22,
            sshUser: "fake-user",
            sshKey: "fake-key"
        };

        vi.spyOn(Storage.prototype, "getItem").mockReturnValue("fake-encrypted-settings");

        vi.spyOn(UtilityFunctions, "decrypt").mockResolvedValue(JSON.stringify(fakeSettings));

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ plaintext: JSON.stringify({
                    databaseHost: "fake-db-host",
                    sshHost: "fake-ssh-host",
                    sshPort: 22,
                    sshUser: "fake-user",
                    sshKey: "fake-key"
                }) })
        }));
    });

    it("should start the tunnel when enabled", async () => {
        await enableTunnel(true);

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/start-tunnel",
            expect.objectContaining({
                method: "POST",
                headers: {"Content-Type": "application/json"},
            })
        );
    });

    it("should return when saved settings are missing", async () => {
        vi.spyOn(Storage.prototype, "getItem").mockReturnValue("");

        await enableTunnel(true);

        expect(fetch).not.toHaveBeenCalled();
    });

    it("should throw error when bad response", async () => {

        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        vi.stubGlobal("fetch", vi.fn((url: string) => {
            if(url == "http://localhost:3001/start-tunnel") {
                return Promise.resolve({
                    ok: false
                });
            }

            if(url == "http://localhost:3001/decrypt") {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ plaintext: JSON.stringify({
                            databaseHost: "fake-db-host",
                            sshHost: "fake-ssh-host",
                            sshPort: 22,
                            sshUser: "fake-user",
                            sshKey: "fake-key"
                        }) })
                });
            }
        }));

        await enableTunnel(true);

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/start-tunnel",
            expect.objectContaining({
                method: "POST",
                headers: {"Content-Type": "application/json"},
            })
        );

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][1].message).toEqual("Server error: undefined")
    });

    it("should stop tunnel when enableTunnel false", async () => {
        await enableTunnel(false);

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/stop-tunnel",
            expect.objectContaining({
                method: "POST"
            })
        );
    });

    it("should throw error when cant stop tunnel", async () => {

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false
        }));
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        await enableTunnel(false);

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/stop-tunnel",
            expect.objectContaining({
                method: "POST"
            })
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleErrorSpy.mock.calls[0][1].message).toEqual("Server error: undefined")

    });
});

describe("encrypt", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ plaintext: JSON.stringify({
                    databaseHost: "fake-db-host",
                    sshHost: "fake-ssh-host",
                    sshPort: 22,
                    sshUser: "fake-user",
                    sshKey: "fake-key"
                }) })
        }));
    });

    it("should encrypt", async () => {
        await encrypt("test");

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/encrypt",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plaintext: "test" })
            })
        );
    })
})

describe("decrypt", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ plaintext: JSON.stringify({
                    databaseHost: "fake-db-host",
                    sshHost: "fake-ssh-host",
                    sshPort: 22,
                    sshUser: "fake-user",
                    sshKey: "fake-key"
                }) })
        }));
    });

    it("should decrypt", async () => {
        await decrypt("test");

        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/decrypt",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ciphertext: "test" })
            })
        );
    })

    it("throws an error if fetch response is not ok", async () => {
        const errorMessage = "Mock decrypt error";

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: errorMessage, clearLocalStorage: true })
        }));

        const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});

        await expect(decrypt("fake-ciphertext"))
            .rejects
            .toThrow(errorMessage);


        expect(removeItemSpy).toHaveBeenCalledWith("db_list");
        expect(removeItemSpy).toHaveBeenCalledWith("db_settings");
        expect(removeItemSpy).toHaveBeenCalledWith("gpt_settings");
    });

    it("throws an error if fetch response is not ok without message provided", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({})
        }));


        await expect(decrypt("fake-ciphertext"))
            .rejects
            .toThrow("Decrypt failed");
    });
})
