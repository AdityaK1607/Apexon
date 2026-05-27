import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_BASE_URL = os.getenv(
    "LINKEDIN_API_BASE_URL",
    "https://api.apify.com/v2/actors/fantastic-jobs/advanced-linkedin-job-search-api/runs"
)
API_TOKEN = os.getenv("LINKEDIN_API_TOKEN", "REPLACE_YOUR_APIFY_TOKEN")
MAX_COST = float(os.getenv("LINKEDIN_MAX_COST", "5"))

def get_linkedin_jobs(search_query: str = "", limit: int = 20):
    if not API_TOKEN or API_TOKEN == "REPLACE_YOUR_APIFY_TOKEN":
        return [
            {
                "title": "Senior Python Developer",
                "company": "Apexon",
                "location": "Remote",
                "description": "Build scalable backend services using Python and FastAPI.",
                "source": "LinkedIn",
                "url": "",
            },
            {
                "title": "Frontend Engineer",
                "company": "Tech Corp",
                "location": "New York, NY",
                "description": "React/TypeScript developer to build modern web applications.",
                "source": "LinkedIn",
                "url": "",
            },
            {
                "title": "Data Engineer",
                "company": "DataCo",
                "location": "San Francisco, CA",
                "description": "Build data pipelines and work with cloud infrastructure.",
                "source": "LinkedIn",
                "url": "",
            },
        ]

    actor_input = {
        "query": search_query,
        "maxCostPerRun": MAX_COST,
        "limit": limit,
    }

    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    }

    run_resp = requests.post(
        API_BASE_URL,
        params={"token": API_TOKEN, "wait": "0"},
        json=actor_input,
        headers=headers,
        timeout=30,
    )
    run_resp.raise_for_status()
    run_data = run_resp.json()

    run_id = run_data["data"]["id"]
    dataset_id = run_data["data"].get("defaultDatasetId", run_id)

    for _ in range(60):
        time.sleep(1)
        status_resp = requests.get(
            f"https://api.apify.com/v2/actor-runs/{run_id}",
            params={"token": API_TOKEN},
            headers=headers,
            timeout=10,
        )
        status_resp.raise_for_status()
        status = status_resp.json()["data"].get("status", "")
        if status in ("SUCCEEDED", "FAILED", "TIMED-OUT"):
            break

    items_url = f"https://api.apify.com/v2/datasets/{dataset_id}/items"
    items_resp = requests.get(
        items_url,
        params={"token": API_TOKEN},
        headers=headers,
        timeout=30,
    )
    items_resp.raise_for_status()
    items = items_resp.json()

    jobs = []
    for item in items:
        jobs.append({
            "title": item.get("title", "N/A"),
            "company": item.get("company", "N/A"),
            "location": item.get("location", "N/A"),
            "description": item.get("description", "No description provided."),
            "source": "LinkedIn",
            "url": item.get("url", ""),
        })

    return jobs[:limit]
