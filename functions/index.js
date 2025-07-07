const functions = require("firebase-functions");
const {fetch} = require("undici");
const {initializeApp} = require("firebase-admin/app");
const {getAppCheck} = require("firebase-admin/app-check");

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

  try {
    const url = req.body.url;
    const backendRes = await fetch(
        "https://downloader-221299796310.europe-central2.run.app/download",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "X-Firebase-AppCheck": req.get("X-Firebase-AppCheck") || "",
          },
          body: JSON.stringify({url}),
        });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return res.status(backendRes.status).send(errorText);
    }

    res.set("Content-Type", "video/mp4");
    backendRes.body.pipe(res);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});
