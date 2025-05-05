import express, { json } from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { createTunnel } from "tunnel-ssh";
import { Server } from "node:net";
import { Client } from "ssh2";

const app = express();
app.use(json());
app.use(cors())

const tunnelOptions = {
  autoClose: false,
  reconnectOnError: true
};

let server: Server;
let client: Client;

/* eslint-disable @typescript-eslint/no-explicit-any */
app.post("/start-tunnel", async (request, result): Promise<any> => {
  if (server && server.listening) {
    return result.json({ status: "Tunnel already active" });
  }

  const forwardOptions = {
    localHost: 'http://localhost',
    localPort: 8000,
    dstHost: request.body.databaseHost,
    dstPort: 8000,
  };
  const sshOptions = {
    username: request.body.sshUser,
    password: request.body.sshKey,
    host: request.body.sshHost,
    port: Number(request.body.sshPort)
  };

  try {
    [server, client] = await createTunnel(tunnelOptions, {port: 8000}, sshOptions, forwardOptions);

    client.on("error", (error) => {
      console.log("SSH Client Error:", error.message);
    });

    server.on("error", (error) => {
      console.error("Server Error:", error.message);
    });

    // ignore resets (Must keep running locally because encrypytion is handled by it, if we close, we break storage.)
    server.on("connection", (socket) => {
      socket.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "ECONNRESET") return;         
        console.error("Socket Error:", error.message);    // log everything else
      });
    });

    server.on("close", () => {
      console.log("Server connection closed.");
    });
    return result.json({ status: "Tunnel started" });
  } catch (error) {
    console.log("Error starting tunnel:", error);
    return result.status(400).json({ error: "Failed to start tunnel" });
  }
});

app.post("/stop-tunnel", async (_request, result): Promise<any> => {
  if (!server || !(server.listening)) {
    return result.json({ status: "No active tunnel to stop" });
  }

  server.close();
  client.destroy();

  return result.json({ status: "Tunnel stopped" });
});

app.post("/encrypt", async (request, result): Promise<any> => {
  const { plaintext } = request.body as { plaintext?: string };
  if (typeof plaintext !== "string") {
    return result
      .status(400)
      .json({ error: "Missing or invalid `plaintext` in request body" });
  }

  try {
    const ciphertext = await encryptionUtilities.encrypt(plaintext);
    return result.json({ ciphertext });
  } catch (error: any) {
    console.error("Encryption error:", error);
    return result
      .status(500)
      .json({ error: error.message || "Encryption failed" });
  }
});

app.post("/decrypt", async (request, result): Promise<any> => {
  const { ciphertext } = request.body as { ciphertext?: string };
  if (typeof ciphertext !== "string") {
    return result.status(400).json({ error: "Missing ciphertext" });
  }

  try {
    const plaintext = await encryptionUtilities.decrypt(ciphertext);
    return result.json({ plaintext });
  } 
  catch {
    deleteSecureStorageKeyFile();
    return result.status(400).json({
      error: "Decryption failed",
      clearLocalStorage: true,
    });
  }
});

const GLOBAL_AES_KEY: Buffer = (() => {
  return ensureSecureStorageKey();
})();

export const encryptionUtilities = {
  async encrypt(plaintext: string): Promise<string> {
    const key = GLOBAL_AES_KEY;
    const iv  = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ct     = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, ct, tag]);
    return payload.toString("base64");
  },

  async decrypt(ciphertextB64: string): Promise<string> {
    const data = Buffer.from(ciphertextB64, "base64");
    if (data.length < 12 + 16) {
      throw new Error("Ciphertext too short");
    }
  
    const iv      = data.subarray(0, 12);
    const tag     = data.subarray(- 16);
    const ct      = data.subarray(12, - 16);
    const key     = GLOBAL_AES_KEY;
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
  
    const ptBuf = Buffer.concat([
      decipher.update(ct),
      decipher.final(),
    ]);
    return ptBuf.toString("utf8");
  }
}

function ensureSecureStorageKey(): Buffer {
  const __filename = fileURLToPath(import.meta.url);
  
  const keyPath = path.join(
    path.dirname(__filename),
    "Secure_Storage_key.bin"
  );

  /* istanbul ignore next -- @preserve */
  const createNewKey = (): Buffer => {
    const key = crypto.randomBytes(32);
    fs.mkdirSync(path.dirname(keyPath), { recursive: true });
    fs.writeFileSync(keyPath, key, { mode: 0o600 });
    console.info("Generated new Secure_Storage_key.bin");
    return key;
  };

  try {
    if (!fs.existsSync(keyPath)) return createNewKey();

    const key = fs.readFileSync(keyPath);
    /* istanbul ignore next -- @preserve */
    if (key.length !== 32) {
      console.warn("Key length incorrect – regenerating");
      return createNewKey();
    }
    return key;
  } catch (error) {
    /* istanbul ignore next -- @preserve */ {
      console.error("Failed to read/write key:", error);
      return createNewKey();
    }
  }
}

function deleteSecureStorageKeyFile(): void {
  const __filename = fileURLToPath(import.meta.url);
  const keyPath = path.join(
    path.dirname(__filename),
    "Secure_Storage_key.bin"
  );

  try {
    fs.rmSync(keyPath, { force: true });
    console.info(`Deleted key file at ${keyPath}, please restart the application`);
    ensureSecureStorageKey(); // Recreate the key file
  } catch (error: any) {
    /* istanbul ignore next -- @preserve */
    console.error(`Failed to delete key file at ${keyPath}:`, error);
  }
}


const PORT = 3001;
app.listen(PORT, () => console.log(`Tunnel server running on port ${PORT}`));

export { app };
