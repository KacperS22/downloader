
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js"

const firebaseConfig = {
  apiKey: "AIzaSyCSIlf59nGwmwcXep0fz9F0AiCSvWNUTIs",
  authDomain: "downloader-64781.firebaseapp.com",
  projectId: "downloader-64781",
  storageBucket: "downloader-64781.firebasestorage.app",
  messagingSenderId: "221299796310",
  appId: "1:221299796310:web:9118e9324d40eb64250ef7"
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcQ8HUrAAAAAIEhoVr8mySYETQJoHE_8auJbs0y'),
  isTokenAutoRefreshEnabled: true
});

async function fetchMetadata() {
  const url = document.getElementById("url").value;
  if (!url) return alert("Paste video URL");

  const tokenResult = await getToken(appCheck, true);
  const token = tokenResult.token;

  const res = await fetch('https://us-central1-downloader-64781.cloudfunctions.net/proxyToBackend', {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      "X-Firebase-AppCheck": token
    },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const text = await res.text();
    return alert("Error: " + text);
  }

  const metadata = await res.json();

  // Wyświetlanie metadanych
  const output = document.getElementById("output");
  output.innerHTML = `
    <h3>${metadata.title}</h3>
    <p><strong>Uploader:</strong> ${metadata.uploader}</p>
    <p><strong>Duration:</strong> ${Math.floor(metadata.duration / 60)} min ${metadata.duration % 60} sec</p>
    <p><strong>Views:</strong> ${metadata.view_count.toLocaleString()}</p>
    <img src="${metadata.thumbnail}" alt="Thumbnail" width="320">
  `;
}

document.getElementById("downloadBtn").addEventListener("click", fetchMetadata);