# PDFWeaver

A fast, secure tool to merge PDFs and images into a single PDF document. Upload files, drag to reorder, preview, and download or send via email.

![React](https://img.shields.io/badge/React-19-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Merge PDFs & images** into a single PDF (PNG, JPG, BMP, TIFF, WEBP)
- **Drag to reorder** pages before merging
- **Live preview** of uploaded files with PDF page thumbnails
- **Custom filename** for the output PDF
- **Email delivery** of merged PDFs via SMTP
- **Processing overlay** with progress indicator
- **Fully responsive** across mobile, tablet, and desktop
- **Input sanitization** on both frontend and backend (path traversal, injection protection)
- **File validation** with size limits (50MB/file, 50 files max) and extension whitelist

## Tech Stack

| Layer    | Technology                                |
| -------- | ----------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind v4   |
| UI       | shadcn/ui, Lucide icons, Sonner toasts    |
| PDF      | pdf.js (preview), PyPDF2 (merge)          |
| Backend  | Python, FastAPI, Pillow                   |
| Email    | SMTP via python `smtplib`                 |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Setup

```bash
# Clone
git clone https://github.com/reachvivek/mergepdf.git
cd mergepdf

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev

# Backend (new terminal)
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app:app --reload --port 5000
```

Open http://localhost:5173 in your browser.

### Environment Variables

**Frontend** (`frontend/.env`)

| Variable       | Description        | Default                 |
| -------------- | ------------------ | ----------------------- |
| `VITE_API_URL` | Backend API URL    | `http://localhost:5000` |

**Backend** (`backend/.env`)

| Variable       | Description              | Default                                    |
| -------------- | ------------------------ | ------------------------------------------ |
| `CORS_ORIGINS` | Comma-separated origins  | `http://localhost:5173,http://localhost:3000` |
| `SMTP_HOST`    | SMTP server host         | `smtp.gmail.com`                           |
| `SMTP_PORT`    | SMTP server port         | `587`                                      |
| `SMTP_USER`    | SMTP login username      |                                            |
| `SMTP_PASS`    | SMTP login password      |                                            |
| `SMTP_FROM`    | Sender email address     | Same as `SMTP_USER`                        |

## Project Structure

```
pdfweaver/
  frontend/
    src/
      components/     # UI components (FileCard, FileGrid, PdfPreview, etc.)
      hooks/          # Custom hooks (useFileManager, usePdfThumbnail)
      lib/            # API client, sanitization, utils
  backend/
    app.py            # FastAPI server with merge + email endpoints
```

## API Endpoints

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/merge`         | Merge files, return PDF        |
| POST   | `/api/merge-and-email` | Merge files, send via email  |
| GET    | `/api/health`        | Health check                   |

## Security

- Filename sanitization on both client and server
- Path traversal protection
- UUID-only temp file paths (user filenames never used in paths)
- File extension whitelist
- Per-file size limit (50MB)
- Email address validation via regex
- CORS restricted to configured origins

## License

MIT

---

Developed by [Vivek](https://linkedin.com/in/reachvivek)
