import fs from "node:fs";
import { describe, vi, beforeEach, it, expect } from "vitest";

const mockServer = {
    listening: true,
    // our "on" stub now also handles "connection"
    on: vi.fn((event, callback) => {
      if (event === "connection") {
        // fire immediately with a fake socket
        const fakeSocket = {
          on: vi.fn((evt, sockCb) => {
            if (evt === "error") {
              // first, ECONNRESET → should be ignored
              sockCb({ code: "ECONNRESET", message: "reset by peer" });
              // then a real error → should be logged
              sockCb({ code: "EOTHER",    message: "other error occurred" });
            }
          }),
        };
        callback(fakeSocket);
      } else if (event === "error") {
        setTimeout(() => callback(new Error("Mock server error")), 10);
      } else if (event === "close") {
        setTimeout(() => callback(), 20);
      }
    }),
    close: vi.fn(() => {
      mockServer.listening = false;
    }),
  };

const mockServerNotListening = {
    listening: false,
    on: vi.fn((event, callback) => {
        if (event === "error") {
            setTimeout(() => callback(new Error("Mock server error")), 10);
        } else if (event === "close") {
            setTimeout(() => callback(), 20);
        }
    }),
    close: vi.fn(),
};

const mockClient = {
    on: vi.fn((event, callback) => {
        if (event === "error") {
            setTimeout(() => callback(new Error("Mock client error")), 10);
        }
    }),
    destroy: vi.fn(),
};

vi.mock("tunnel-ssh", () => {
    return {
        createTunnel: vi.fn((_parameter1, _parameter2, parameter3) => {
            if (parameter3.username === "tunnel") {
                return [mockServerNotListening, mockClient];
            } else if (parameter3.username == "activeTunnel") {
                return [mockServer, mockClient]
            } else {
                console.log("username is", parameter3.username)
                throw new Error("Invalid username");
            }
        }),
    };
});

const { createTunnel } = await import("tunnel-ssh");

describe("Tunnel Server", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should start the tunnel", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const data = {
            databaseHost: "dbhost",
            sshHost: "sshhost",
            sshPort: 22,
            sshUser: "tunnel",
            sshKey: "sshkey",
        };

        const response = await fetch(`http://localhost:${port}/start-tunnel`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const returned_value = await response.json()

        expect(returned_value.status).toBe("Tunnel started");
        expect(createTunnel).toHaveBeenCalledWith(
            expect.objectContaining({
                "autoClose": false,
                "reconnectOnError": true,
            }),
            expect.objectContaining({port: 8000}),
            expect.objectContaining({
                username: "tunnel",
                password: "sshkey",
                host: "sshhost",
                port: 22,
            }),
            expect.objectContaining({
                localHost: "http://localhost",
                localPort: 8000,
                dstHost: "dbhost",
                dstPort: 8000,
            })
        );
    });
    it("should ignore ECONNRESET but log other socket errors", async () => {
        const errorSpy = vi.spyOn(console, "error");
      
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const listener = app.listen(0);
        const port = (listener.address() as { port: number }).port;
      
        await fetch(`http://localhost:${port}/start-tunnel`, {
          method: "POST",
          body: JSON.stringify({
            databaseHost: "dbhost",
            sshHost:      "sshhost",
            sshPort:      22,
            sshUser:      "activeTunnel",
            sshKey:       "sshkey",
          }),
          headers: { "Content-Type": "application/json" },
        });
      
        await new Promise((r) => setTimeout(r, 0));
      
        const socketErrorCalls = errorSpy.mock.calls.filter(
            ([label]) => label === "Socket Error:"
          );
        
          // should only have logged the non-ECONNRESET socket error
          expect(socketErrorCalls).toHaveLength(1);
          expect(socketErrorCalls[0]).toEqual(["Socket Error:", "other error occurred"]);
      });

    it("should alert when there is already an active tunnel", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const data = {
            databaseHost: "dbhost",
            sshHost: "sshhost",
            sshPort: 22,
            sshUser: "activeTunnel",
            sshKey: "sshkey",
        };

        await fetch(`http://localhost:${port}/start-tunnel`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await fetch(`http://localhost:${port}/start-tunnel`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const returned_value = await response.json()

        expect(returned_value.status).toBe("Tunnel already active");

        await fetch(`http://localhost:${port}/stop-tunnel`, {
            method: "POST"
        })
    });

    it("should alert when there is no tunnel to stop", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const response = await fetch(`http://localhost:${port}/stop-tunnel`, {
            method: "POST"
        })

        const returned_value = await response.json()

        expect(returned_value.status).toBe("No active tunnel to stop");
    })

    it("should stop the tunnel", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        mockServer.listening = true

        const response = await fetch(`http://localhost:${port}/stop-tunnel`, {
            method: "POST"
        })

        const returned_value = await response.json()

        expect(returned_value.status).toBe("Tunnel stopped");
    });

    it("should error failing to start the tunnel", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const data = {
            databaseHost: "dbhost",
            sshHost: "sshhost",
            sshPort: 22,
            sshUser: "noTunnel",
            sshKey: "sshkey",
        };

        const response = await fetch(`http://localhost:${port}/start-tunnel`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        expect(response.status).toBe(400);
        expect(createTunnel).toHaveBeenCalledWith(
            expect.objectContaining({
                "autoClose": false,
                "reconnectOnError": true,
            }),
            expect.objectContaining({port: 8000}),
            expect.objectContaining({
                username: "noTunnel",
                password: "sshkey",
                host: "sshhost",
                port: 22,
            }),
            expect.objectContaining({
                localHost: "http://localhost",
                localPort: 8000,
                dstHost: "dbhost",
                dstPort: 8000,
            })
        );
    });

    it("should encrypyt the data", async () => {
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const plaintext = "plain text string"

        const response_encrypted = await fetch(`http://localhost:${port}/encrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plaintext: plaintext }),
        });

        const { ciphertext } = await response_encrypted.json();

        expect(ciphertext).not.toBe(plaintext)

        const response_decrypted = await fetch(`http://localhost:${port}/decrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext }),
        });

        const decrypted = await response_decrypted.json();

        expect(decrypted.plaintext).toBe(plaintext);
    });

    it("should alert encrypt if not string", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const value = {
            "plaintext": "wow"
        };

        const response_encrypted = await fetch(`http://localhost:${port}/encrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plaintext: value }),
        });

        expect(response_encrypted.status).toBe(400);
    });

    it("should alert decrypt if not string", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        const { app } = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;

        const ciphertext = {
            "plaintext": "wow"
        };

        const response_decrypted = await fetch(`http://localhost:${port}/decrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext }),
        });

        expect(response_decrypted.status).toBe(400);
    });


    it("should alert if error encrypting", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        const blackbox = await import("../../../src/tunnel/tunnel-server");
        vi.spyOn(blackbox.encryptionUtilities, "encrypt").mockImplementation(() => {
            throw new Error("Mock encryption failure");
        });
      
        const server = blackbox.app.listen(0);
        const port = (server.address() as { port: number }).port;
      
        const response = await fetch(`http://localhost:${port}/encrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plaintext: "test" }),
        });
      
        expect(response.status).toBe(500);
    });

    it("should alert if error encrypting without message", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        const blackbox = await import("../../../src/tunnel/tunnel-server");
        vi.spyOn(blackbox.encryptionUtilities, "encrypt").mockImplementation(() => {
            /* eslint-disable unicorn/error-message */
            throw new Error();  
        });
      
        const server = blackbox.app.listen(0);
        const port = (server.address() as { port: number }).port;
      
        const response = await fetch(`http://localhost:${port}/encrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plaintext: "test" }),
        });
      
        expect(response.status).toBe(500);
    });

    it("should alert if error decrypting fs does exist", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        vi.spyOn(fs, "existsSync").mockImplementation(() => {return false;});
        const {app} = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;
        
        const badCiphertext = "invalid";
        
        const response = await fetch(`http://localhost:${port}/decrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext: badCiphertext }),
        });
        
        expect(response.status).toBe(400);
    });

    it("should alert if error decrypting fs does not exist", async () => {
        vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
        vi.spyOn(fs, "rmSync").mockImplementation(() => {});
        vi.spyOn(fs, "existsSync").mockImplementation(() => {return true;});
        const {app} = await import("../../../src/tunnel/tunnel-server");
        const server = app.listen(0);
        const port = (server.address() as { port: number }).port;
        
        const badCiphertext = "invalid";
        
        const response = await fetch(`http://localhost:${port}/decrypt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ciphertext: badCiphertext }),
        });
        
        expect(response.status).toBe(400);
    });
});
