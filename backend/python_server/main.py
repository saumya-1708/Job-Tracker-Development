import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import requests
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup

# --- FASTAPI SETUP ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GO_SERVER_URL = "http://localhost:8080/jobs-data"
GET_PREFERENCES_URL = "http://localhost:8080/get-preferences"  # new Go endpoint

# --- Helper Functions ---
def is_recent_job_posting(text: str) -> bool:
    text_lower = text.lower()
    if "just posted" in text_lower or "new" in text_lower or "24 hours" in text_lower:
        return True
    for i in range(1, 8):
        if f"{i} day" in text_lower or f"{i}d" in text_lower:
            return True
    return False

def scrape_jobs(keywords: List[str], locations: List[str] = None) -> List[Dict]:
    print("Starting job scraping based on user preferences...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    try:
        driver = webdriver.Chrome(options=chrome_options)
    except Exception as e:
        print(f"❌ Failed to initialize Chrome driver: {e}")
        return []

    scraped_jobs = []

    for keyword in keywords:
        print(f"🔍 Searching for: {keyword}")
        try:
            from googlesearch import search
            for url in search(f"{keyword} job", num_results=5, lang="en"):
                try:
                    time.sleep(random.uniform(2, 5))
                    driver.get(url)
                    soup = BeautifulSoup(driver.page_source, "html.parser")
                    text = soup.get_text(" ", strip=True).lower()

                    # Check for recent job postings
                    if any(word in text for word in ["apply now", "vacancy", "hiring", "job", "careers"]) and is_recent_job_posting(text):
                        job_location = "Remote"
                        if locations:
                            # Optionally check if location keyword exists in page
                            for loc in locations:
                                if loc.lower() in text:
                                    job_location = loc
                                    break

                        scraped_jobs.append({
                            "Title": keyword,
                            "Company": "N/A",
                            "Website": url,
                            "Skills": [keyword],
                            "Location": job_location,
                            "Type": "Full-Time"
                        })
                        print(f"    ✅ Job detected: {keyword} @ {job_location}")
                except (TimeoutException, WebDriverException) as e:
                    print(f"    ⚠️ Browser error on {url}: {e}")
                    continue
        except Exception as e:
            print(f"❌ Google search failed for '{keyword}': {e}")
            continue

    driver.quit()
    return scraped_jobs

# --- ROUTES ---
@app.post("/recommend-jobs")
async def recommend_jobs(
    file: UploadFile = File(...),
    preferences: str = Form(...),
):
    # --- Parse preferences JSON ---
    try:
        pref_data = json.loads(preferences)
        preference_id = pref_data.get("preferenceId")  # optional if needed
    except Exception as e:
        return {"status": "error", "message": f"Invalid preferences JSON: {e}"}

    # --- Fetch saved preferences from Go ---
    user_preferences = {}
    try:
        res = requests.post(GET_PREFERENCES_URL,
                            headers={"Content-Type": "application/json"},
                            json={"preferenceId": preference_id},
                            timeout=15)
        if res.ok:
            user_preferences = res.json()
            print(f"Fetched user preferences: {user_preferences}")
        else:
            print(f"Failed to fetch preferences, using defaults. Status: {res.status_code}")
    except Exception as e:
        print(f"Error fetching preferences: {e}")

    # --- Decide keywords for scraping ---
    roles = user_preferences.get("roles", ["Software Engineer", "Python", "JavaScript", "Problem-solving"])
    locations = user_preferences.get("locations", [])

    # --- Scrape jobs dynamically ---
    jobs = scrape_jobs(roles, locations)

    # --- Send jobs to Go server ---
    try:
        response = requests.post(
            GO_SERVER_URL,
            json={"userId": user_preferences.get("userId"),
                  "preferenceId": preference_id,
                  "jobs": jobs},
            timeout=30
        )
        if response.status_code == 200:
            print("✅ Successfully sent jobs to Go server")
        else:
            print(f"❌ Failed to send jobs. Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error sending jobs to Go server: {e}")

    # --- Return jobs to frontend ---
    return {"status": "success", "jobs": jobs}
