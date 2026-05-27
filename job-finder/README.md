# Job Finder

A full-stack job board built with React (Vite), FastAPI, and PostgreSQL.

## Features
- Local jobs (stored in PostgreSQL)
- Add new jobs via UI
- LinkedIn Jobs section using a third-party Apify API
- Search bar to filter LinkedIn jobs by title, company, or location
- Apexon-style header and footer

## Tech Stack
- Frontend: React + Vite
- Backend: FastAPI
- Database: PostgreSQL
- API: Apify (LinkedIn jobs)

## Run Locally

### Backend
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload

### Frontend
cd ../frontend
npm install
npm run dev
