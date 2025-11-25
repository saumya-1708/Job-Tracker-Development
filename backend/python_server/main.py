from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime
from bson import ObjectId
import pymongo
import io
import PyPDF2
import docx2txt
import json

# MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017")
db = client["jobtracker"]
prefs_collection = db["preferences"]  # same collection as Go backend

# FastAPI setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers
def extract_keywords_from_resume(resume_text: str) -> List[str]:
    return ["Python", "Software Engineer", "JavaScript"]

def read_resume(file: UploadFile) -> str:
    content = file.file.read()
    file_type = file.filename.split('.')[-1].lower()
    if file_type == "pdf":
        text = ""
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    elif file_type == "docx":
        return docx2txt.process(io.BytesIO(content))
    else:
        return content.decode("utf-8")

# Route
@app.post("/recommend-jobs")
async def recommend_jobs(file: UploadFile = File(...), preferences: str = Form(...)):
    pref_data = json.loads(preferences)
    preference_id = ObjectId(pref_data["preferenceId"])

    resume_text = read_resume(file)
    keywords = extract_keywords_from_resume(resume_text)

    jobs: Dict[str, List[str]] = {}
    for kw in keywords:
        jobs[kw] = [
            f"https://jobs.example.com/{kw.lower()}-1",
            f"https://jobs.example.com/{kw.lower()}-2"
        ]

    prefs_collection.update_one(
    {"_id": preference_id},
    {"$set": {
        "jobs": jobs,
        "status": "success",
        "updatedAt": datetime.utcnow()
    }}
)


    if result.modified_count == 1:
        return {"status": "success", "preferenceId": str(preference_id), "jobs": jobs}
    else:
        return {"status": "failed", "message": "Preference not found"}
