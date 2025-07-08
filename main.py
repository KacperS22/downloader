from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import piexif
import io

app = FastAPI()

@app.post("/metadata")
async def extract_metadata(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        exif_data = piexif.load(image.info.get("exif", b""))

        metadata = {}
        
        for ifd_name in exif_data:
            for tag in exif_data[ifd_name]:
                tag_name = piexif.TAGS[ifd_name][tag]["name"]
                value = exif_data[ifd_name][tag]
                if isinstance(value, bytes):
                    try:
                        value = value.decode(errors="ignore")
                    except:
                        continue
                metadata[tag_name] = value

        return JSONResponse(content=metadata)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)