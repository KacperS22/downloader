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

async function download(){
    
    const url = document.getElementById("url").value
    if (!url) return alert("Paste video URL")

    const { token } = await getToken(appCheck, /* forceRefresh= */ true);
    
    const res = await fetch('https://downloader-64781.web.app/__proxy__/proxyToBackend', {
      method: "POST",
      headers: { 
        "Content-type": "application/json",
        "X-Firebase-AppCheck": token
      },
      body: JSON.stringify({ url })
    });   

    if (!res.ok) {
        const text = await res.text()
        return alert("Error: " + text)    
    }

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = "video.mp4";
    a.click();
}

document.getElementById("downloadBtn").addEventListener("click", download)