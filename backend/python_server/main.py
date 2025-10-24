import json
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict
from fastapi.middleware.cors import CORSMiddleware
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from googlesearch import search
from bs4 import BeautifulSoup
import io
import docx2txt
import PyPDF2
import requests
import time
import random
from datetime import datetime, timedelta

# --- FASTAPI SETUP ---
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GO SERVER CONFIG ---
GO_SERVER_URL = "http://localhost:8080/jobs-data"

# --- PYDANTIC MODELS ---
class Job(BaseModel):
    title: str
    company: str
    website: str
    skills: List[str]

# --- ML LOGIC (Conceptual Placeholder) ---
def extract_keywords_from_resume(resume_text: str) -> List[str]:
    print("⚙️  Parsing resume to extract keywords...")
    print(f"Resume content received:\n{resume_text[:200]}...")
    return ["Software Engineer", "JavaScript", "Python", "Problem-solving"]

# --- ADVANCED WEB SCRAPING LOGIC ---
def is_recent_job_posting(text: str) -> bool:
    """
    Conceptual function to check if a job posting is recent based on text.
    In a real application, this would use a robust date parsing library.
    """
    text_lower = text.lower()
    today = datetime.now()

    # Look for common phrases indicating recency
    if "just posted" in text_lower or "new" in text_lower or "24 hours" in text_lower:
        return True

    # Look for "X days ago"
    for i in range(1, 8):
        if f"{i} day" in text_lower or f"{i}d" in text_lower:
            return True

    # This is a very basic heuristic. A more advanced version would extract the
    # date and compare it to today's date.
    return False


def scrape_jobs(keywords: List[str]) -> Dict[str, List[str]]:
    """
    Automates a browser to scrape job listings with improved resilience.
    """
    print("Starting advanced job scraping process with Selenium...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    try:
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        print(f"❌ Failed to initialize the browser driver: {e}")
        return {}

    results_by_keyword = {}

    for keyword in keywords:
        print(f"🔍 Searching for: {keyword}")
        results_by_keyword[keyword] = []
        try:
            for url in search(f"{keyword} job", num_results=5, lang="en"):
                print(f"  → {url}")
                try:
                    # Add a random delay to simulate human behavior
                    time.sleep(random.uniform(2, 5))
                    driver.get(url)
                    
                    # Get the page source after all dynamic content has loaded
                    soup = BeautifulSoup(driver.page_source, "html.parser")
                    text = soup.get_text(" ", strip=True).lower()

                    # Check for job posting keywords AND check for recency
                    if any(word in text for word in ["apply now", "vacancy", "hiring", "job", "careers"]) and is_recent_job_posting(text):
                        print("    ✅ Job posting detected and is recent.")
                        results_by_keyword[keyword].append(url)
                    else:
                        print("    ℹ️ No recent job posting keywords found.")
                        
                except (TimeoutException, WebDriverException) as e:
                    print(f"    ⚠️ A browser error occurred while fetching {url}: {e}")
                    continue
                except Exception as e:
                    print(f"    ⚠️ An unexpected error occurred: {e}")
                    continue
        except Exception as e:
            print(f"❌ Search failed for '{keyword}': {e}")
            continue

    driver.quit()
    return results_by_keyword

# --- ROUTES ---
@app.post("/recommend-jobs")
async def recommend_jobs(file: UploadFile = File(...)):
    """
    Endpoint to receive resume file, extract skills,
    and send hardcoded job data to Go server (for testing).
    """
    # 1. Read the file content
    file_content = await file.read()
    file_type = file.filename.split('.')[-1].lower()
    resume_text = ""
    if file_type == "pdf":
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        for page in pdf_reader.pages:
            resume_text += page.extract_text()
    elif file_type == "docx":
        resume_text = docx2txt.process(io.BytesIO(file_content)).decode("utf-8")
    else:
        resume_text = file_content.decode("utf-8")

    # 2. Extract keywords (dummy)
    keywords = extract_keywords_from_resume(resume_text)

    # 3. Hardcoded sample jobs (for testing)
    fetched_jobs = {
        "Software Engineer": [
            "https://careers.google.com/jobs/results/12345-software-engineer/",
            "https://www.linkedin.com/jobs/view/67890/"
        ],
        "JavaScript Developer": [
            "https://jobs.microsoft.com/developer/98765",
            "https://www.naukri.com/javascript-developer-jobs"
        ],
        "Python Developer": [
            "https://boards.greenhouse.io/openai/jobs/43210",
            "https://remoteok.com/remote-python-jobs"
        ]
    }

    # 4. Send the hardcoded job data to the Go server
    try:
        print(f"📦 Sending hardcoded results to Go server at {GO_SERVER_URL}")
        response = requests.post(GO_SERVER_URL, json=fetched_jobs, timeout=30)
        
        if response.status_code == 200:
            print("✅ Successfully sent job data to Go server.")
            return {
                "status": "success",
                "message": "Hardcoded job data sent to Go server successfully.",
                "data_sent": fetched_jobs
            }
        else:
            print(f"❌ Failed to send data. Status code: {response.status_code}")
            return {
                "status": "error",
                "message": f"Failed to send data to Go server. Status code: {response.status_code}"
            }
            
    except requests.exceptions.RequestException as e:
        print(f"❌ An error occurred while connecting to the Go server: {e}")
        return {
            "status": "error",
            "message": f"Connection error: {e}"
        }
