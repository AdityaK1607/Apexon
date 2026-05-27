import os
from typing import Optional
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import Base, engine, SessionLocal
from models import Job
from schemas import JobCreate, JobOut
from linkedin_service import get_linkedin_jobs

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Finder API",
    description="Local jobs + LinkedIn jobs from Apify API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/jobs", response_model=list[JobOut])
def read_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@app.post("/jobs", response_model=JobOut)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/api/linkedin-jobs")
def read_linkedin_jobs(query: Optional[str] = "", limit: int = 20):
    jobs = get_linkedin_jobs(search_query=query, limit=limit)

    if query:
        q = query.lower()
        jobs = [
            j for j in jobs
            if (
                q in j["title"].lower()
                or q in j["company"].lower()
                or q in j["location"].lower()
                or q in j["description"].lower()
            )
        ]
    return jobs
