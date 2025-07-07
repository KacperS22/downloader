const fetch = require("node-fetch");
const {onRequest} = require("firebase-functions/v2/https");

exports.proxyToBackend = onRequest(async (req, res) => {
  if (!req.appCheckToken) {
    return res.status(401).send("Missing App Check token.");
  }

  try {
    const url = req.body.url;
    const backendRes = await fetch("https://downloader-221299796310.europe-central2.run.app/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Firebase-AppCheck": req.get("X-Firebase-AppCheck") || "",
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
