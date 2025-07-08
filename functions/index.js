const functions = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getAppCheck } = require("firebase-admin/app-check");
const Busboy = require("busboy");
const { Readable } = require("stream");
const fetch = require("node-fetch");

initializeApp();

exports.proxyToBackend = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "https://mpdownload.xyz");

  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, X-Firebase-AppCheck");
    res.set("Access-Control-Max-Age", "3600");
    return res.status(204).send("");
  }

  const token = req.get("X-Firebase-AppCheck");
  if (!token) {
    return res.status(401).send("Missing App Check token.");
  }

  try {
    await getAppCheck().verifyToken(token);
  } catch (err) {
    return res.status(401).send("Invalid App Check token.");
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const busboy = new Busboy({ headers: req.headers });

  let fileBuffer = null;
  let fileMimeType = "";

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const chunks = [];
    file.on("data", (data) => chunks.push(data));
    file.on("end", () => {
      fileBuffer = Buffer.concat(chunks);
      fileMimeType = mimetype;
    });
  });

  busboy.on("finish", async () => {
    if (!fileBuffer) {
      return res.status(400).send("No file uploaded.");
    }

    try {
      const backendRes = await fetch("https://downloader-221299796310.europe-central2.run.app/metadata", {
        method: "POST",
        headers: {
          "Content-Type": fileMimeType,
        },
        body: fileBuffer,
      });

      if (!backendRes.ok) {
        const text = await backendRes.text();
        return res.status(backendRes.status).send(text);
      }

      const json = await backendRes.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).send("Proxy error: " + err.message);
    }
  });

  req.pipe(busboy);
});