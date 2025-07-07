from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import yt_dlp

app = FastAPI()

@app.post("/metadata")
async def get_metadata(request: Request):
    data = await request.json()
    url = data.get("url")

    ydl_opts = {
        "quiet": True,
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    metadata = {
        "title": info.get("title"),
        "uploader": info.get("uploader"),
        "duration": info.get("duration"),
        "view_count": info.get("view_count"),
        "thumbnail": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url"),
    }

    return JSONResponse(content=metadata)