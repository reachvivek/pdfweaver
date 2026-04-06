import re
import os
import uuid
import tempfile
import io
import smtplib
from email.message import EmailMessage

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfMerger
from PIL import Image

app = FastAPI(title="PDFWeaver")

# CORS - read allowed origins from env, default to localhost for dev
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = tempfile.mkdtemp()
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'}
MAX_FILENAME_LENGTH = 100
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB per file
MAX_FILES = 50

# Email config
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

# Regex: only allow safe chars in filenames
SAFE_FILENAME_RE = re.compile(r'[^a-zA-Z0-9 _\-().]')
PATH_TRAVERSAL_RE = re.compile(r'(\.\.|/|\\|%2e|%2f|%5c)', re.IGNORECASE)
EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')


def sanitize_filename(filename: str) -> str:
    name = filename.strip()
    name = PATH_TRAVERSAL_RE.sub('', name)
    name = SAFE_FILENAME_RE.sub('', name)
    name = re.sub(r'[\s_\-]{2,}', ' ', name)
    name = name.strip('. ')
    return name[:MAX_FILENAME_LENGTH] if name else 'file'


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_upload(files: list[UploadFile]) -> None:
    if len(files) < 1:
        raise HTTPException(400, "At least one file is required.")
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Too many files. Maximum is {MAX_FILES}.")
    for f in files:
        if not f.filename:
            raise HTTPException(400, "File has no name.")
        sanitized = sanitize_filename(f.filename)
        if not allowed_file(sanitized):
            raise HTTPException(400, f"Invalid file type: {f.filename}")


def image_to_pdf(image_path: str) -> str:
    img = Image.open(image_path)
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    pdf_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.pdf")
    img.save(pdf_path, 'PDF', resolution=150)
    return pdf_path


async def _process_and_merge(files: list[UploadFile]) -> bytes:
    validate_upload(files)

    temp_files: list[str] = []
    merger = PdfMerger()

    try:
        for f in files:
            safe_name = sanitize_filename(f.filename or 'file')
            ext = safe_name.rsplit('.', 1)[1].lower()

            content = await f.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(400, f"File too large: {safe_name} ({len(content) // (1024*1024)}MB). Max is 50MB.")

            temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}.{ext}")
            with open(temp_path, 'wb') as out:
                out.write(content)
            temp_files.append(temp_path)

            if ext == 'pdf':
                merger.append(temp_path)
            else:
                pdf_path = image_to_pdf(temp_path)
                temp_files.append(pdf_path)
                merger.append(pdf_path)

        output = io.BytesIO()
        merger.write(output)
        merger.close()
        return output.getvalue()
    finally:
        for path in temp_files:
            try:
                os.remove(path)
            except OSError:
                pass


@app.post("/api/merge")
async def merge_files(files: list[UploadFile] = File(...)):
    pdf_bytes = await _process_and_merge(files)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"},
    )


@app.post("/api/merge-and-email")
async def merge_and_email(
    files: list[UploadFile] = File(...),
    email: str = Form(...),
):
    email = email.strip()
    if not email or len(email) > 254 or not EMAIL_RE.match(email):
        raise HTTPException(400, "Invalid email address.")

    if not SMTP_USER or not SMTP_PASS:
        raise HTTPException(500, "Email is not configured. Set SMTP_USER and SMTP_PASS env vars.")

    pdf_bytes = await _process_and_merge(files)

    msg = EmailMessage()
    msg["Subject"] = "Your Merged PDF"
    msg["From"] = SMTP_FROM
    msg["To"] = email
    msg.set_content("Hi,\n\nPlease find your merged PDF attached.\n\nBest regards,\nPDFWeaver")
    msg.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename="merged.pdf")

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

    return {"message": f"PDF sent to {email}"}


@app.get("/")
async def root():
    return {
        "name": "PDFWeaver",
        "status": "running",
        "developer": "Vivek",
        "contact": "https://reachvivek.vercel.app",
        "linkedin": "https://linkedin.com/in/reachvivek",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}
