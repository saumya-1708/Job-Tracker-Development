import os
import io
import json
import requests
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import PyPDF2
import docx2txt
from concurrent.futures import ThreadPoolExecutor

# --- CONFIG ---
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "6467f485")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "2fbef55f67dd3d1819b9aad100c19fdd")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# 1. EXTRACT TEXT
# -------------------------------
def extract_text(file_content: bytes, filename: str) -> str:
    try:
        ext = filename.split('.')[-1].lower()

        if ext == "pdf":
            pdf = PyPDF2.PdfReader(io.BytesIO(file_content))
            return " ".join([p.extract_text() or "" for p in pdf.pages])

        elif ext == "docx":
            return docx2txt.process(io.BytesIO(file_content))

        return file_content.decode("utf-8", errors="ignore")

    except Exception as e:
        print("❌ Extract error:", e)
        return ""

def strict_filter(jobs, roles, locations):
    filtered = []

    for job in jobs:
        title = job.get("role", "").lower()
        location = job.get("location", "").lower()

        # ✅ STRICT ROLE MATCH
        role_match = any(
            all(word in title for word in r.lower().split())
            for r in roles
        )

        # ✅ STRICT LOCATION MATCH
        location_match = any(loc.lower() in location for loc in locations)

        if role_match and location_match:
            filtered.append(job)

    return filtered

# -------------------------------
# 2. ROLE EXTRACTION
# -------------------------------
ROLE_KEYWORDS = {
    "Backend Developer": ["java", "spring", "node", "express", "golang"],
    "Frontend Developer": ["react", "javascript", "html", "css"],
    "Python Developer": ["python", "flask", "django"],
    "Full Stack Developer": ["full stack", "mern", "mean"],
    "Database Developer": ["sql", "mysql", "mongodb"],
    "Machine Learning Engineer": ["machine learning", "ai", "tensorflow"],
}

def extract_roles(resume_text: str) -> List[str]:
    text = resume_text.lower()
    detected_roles = set()

    for role, keywords in ROLE_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            detected_roles.add(role)

    if not detected_roles:
        detected_roles.add("Software Engineer")

    return list(detected_roles)[:5]


# -------------------------------
# 3. FETCH JOBS PER ROLE
# -------------------------------
def fetch_jobs_for_role(role: str, locations: List[str], salary_range: List[int]) -> List[Dict]:
    jobs = []

    for location in locations:
        try:
            params = {
                "app_id": ADZUNA_APP_ID,
                "app_key": ADZUNA_APP_KEY,
                "results_per_page": 10,
                "what": role,          # strict role query
                "where": location,     # strict location query
                "content-type": "application/json"
            }

            # Salary filter
            if len(salary_range) == 2:
                params["salary_min"] = salary_range[0]
                params["salary_max"] = salary_range[1]

            res = requests.get(
                "https://api.adzuna.com/v1/api/jobs/in/search/1",
                params=params,
                timeout=10
            )

            if res.status_code != 200:
                continue

            data = res.json()

            for job in data.get("results", []):

                title = job.get("title", "").lower()
                loc = job.get("location", {}).get("display_name", "").lower()

                # 🔒 STRICT MATCH HERE (IMPORTANT)
                if not all(word in title for word in role.lower().split()):
                    continue

                if not any(l.lower() in loc for l in locations):
                    continue

                url = job.get("redirect_url")
                if not url or not url.startswith("http"):
                    continue

                jobs.append({
                    "role": job.get("title", ""),
                    "company": job.get("company", {}).get("display_name", "Unknown"),
                    "location": job.get("location", {}).get("display_name", "Unknown"),
                    "url": url,
                })

        except Exception as e:
            print(f"❌ Fetch error for {role}:", e)

    return jobs

# -------------------------------
# 4. FETCH JOBS (PARALLEL)
# -------------------------------
def fetch_jobs(roles: List[str], locations: List[str], salary_range: List[int]) -> List[Dict]:
    all_jobs = []

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(fetch_jobs_for_role, role, locations, salary_range)
            for role in roles
        ]

        for future in futures:
            all_jobs.extend(future.result())

    # Deduplicate by URL
    unique_jobs = {job["url"]: job for job in all_jobs}
    return list(unique_jobs.values())


# -------------------------------
# 5. EXPERIENCE FILTER
# -------------------------------
def filter_by_experience(jobs: List[Dict], experience: int):
    if experience is None:
        return jobs

    filtered = []

    for job in jobs:
        text = (job.get("role", "") + job.get("company", "")).lower()

        if experience <= 2 and "senior" not in text:
            filtered.append(job)
        elif experience > 2:
            filtered.append(job)

    return filtered


# -------------------------------
# 6. FORMAT FOR GO
# -------------------------------
def format_jobs_for_go(jobs: List[Dict]) -> Dict[str, List[str]]:
    result = {}

    for job in jobs:
        role = job["role"]
        value = f"{job['company']} | {job['location']} | {job['url']}"

        result.setdefault(role, []).append(value)

    return result


# -------------------------------
# 7. MAIN API
# -------------------------------
@app.post("/recommend-jobs")
async def recommend_jobs(
    file: UploadFile = File(...),
    preferences: str = Form(...)
):
    print("🚀 Request received")

    try:
        pref_data = json.loads(preferences)
        print("📥 Preferences:", pref_data)

        file_content = await file.read()

        # Step 1: Extract resume text
        resume_text = extract_text(file_content, file.filename)
        if not resume_text.strip():
            return {"jobs": {}}

        # Step 2: Roles
        user_roles = pref_data.get("roles", [])
        roles = user_roles if user_roles else extract_roles(resume_text)
        print("🎯 Roles:", roles)

        # Step 3: Preferences
        locations = pref_data.get("locations", ["India"])
        salary_range = pref_data.get("salaryRange", [])
        experience = pref_data.get("experience")

        # Step 4: Fetch jobs
        jobs = fetch_jobs(roles, locations, salary_range)

        # Step 5: Filter by experience
        jobs = filter_by_experience(jobs, experience)
        jobs = strict_filter(jobs, roles, locations)

        print("📊 Jobs fetched:", len(jobs))

        if not jobs:
            return {"jobs": {}}

        # Step 6: Format for Go
        formatted_jobs = format_jobs_for_go(jobs)

        print("✅ Sending jobs to Go")

        return {"jobs": formatted_jobs}

    except Exception as e:
        print("💥 Critical error:", e)
        return {"jobs": {}}