import yt_dlp
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse

app = FastAPI()

@app.post("/download")

async def download_video(request: Request):

    data = await request.json()
    url = data["url"]

    filename = "video.mp4"
    ydl_opts = {"outtmpl": filename, "format": "bv*+ba/best", "merge_output_format": "mp4"}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    
    return FileResponse(filename, media_type="video/mp4", filename=filename)