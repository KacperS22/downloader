import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js"

const firebaseConfig = {
  apiKey: "AIzaSyCSIlf59nGwmwcXep0fz9F0AiCSvWNUTIs",
  authDomain: "downloader-64781.firebaseapp.com",
  projectId: "downloader-64781",
  storageBucket: "downloader-64781.appspot.com",
  messagingSenderId: "221299796310",
  appId: "1:221299796310:web:9118e9324d40eb64250ef7"
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcQ8HUrAAAAAIEhoVr8mySYETQJoHE_8auJbs0y'),
  isTokenAutoRefreshEnabled: true
});

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("file");
  if (!fileInput.files.length) {
    return alert("Please choose an image");
  }

  const tokenResult = await getToken(appCheck, true);
  const token = tokenResult.token;

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const res = await fetch("https://us-central1-downloader-64781.cloudfunctions.net/proxyToBackend", {
    method: "POST",
    headers: {
      "X-Firebase-AppCheck": token
    },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    return alert("Error: " + text);
  }

  const data = await res.json();
  const output = document.getElementById("output");

  if (Object.keys(data).length === 0) {
    output.innerHTML = "<p>No EXIF metadata found.</p>";
    return;
  }

  output.innerHTML = "<h3>Metadata</h3><ul>" + Object.entries(data).map(
    ([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`
  ).join("") + "</ul>";
});