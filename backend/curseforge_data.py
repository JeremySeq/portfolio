import requests
import os

from dotenv import load_dotenv

load_dotenv()

# === CONFIG ===
API_KEY = os.getenv("CURSEFORGE_API_KEY")  # Or paste it directly here
AUTHOR_ID = 101308977  # Your CurseForge numeric user ID
EXCLUSION_LIST = []  # Exact mod names to ignore

HEADERS = {
    "Accept": "application/json",
    "x-api-key": API_KEY
}

def fetch_mods_by_author():
    url = f"https://api.curseforge.com/v1/mods/search?authorId={AUTHOR_ID}&gameId=432&classId=6"
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json().get("data", [])
    except requests.RequestException as e:
        print(f"Error fetching mods from CurseForge API: {e}")
        return []

def get_download_summary(mods):
    total_downloads = 0
    mod_downloads = []

    for mod in mods:
        name = mod.get("name")
        if name in EXCLUSION_LIST:
            continue

        downloads = mod.get("downloadCount", 0)
        total_downloads += downloads

        mod_downloads.append({
            "name": name,
            "downloads": downloads,
            "link": mod.get("links", {}).get("websiteUrl"),
            "image": mod.get("logo", {}).get("thumbnailUrl")
        })

    mod_downloads.sort(key=lambda x: x["downloads"], reverse=True)
    return total_downloads, mod_downloads

if __name__ == "__main__":
    if not API_KEY:
        print("❌ Missing CURSEFORGE_API_KEY in environment or config.")
        exit(1)

    mods = fetch_mods_by_author()
    if mods:
        total, all_projects = get_download_summary(mods)
        print(f"Total Downloads: {total:,}\n")
        print("Downloads for each project:")
        for project in all_projects:
            print(f"- {project['name']}: {project['downloads']:,}")
            print(f"  Link: {project['link']}")
            print(f"  Image: {project['image']}")
    else:
        print("No mods found or failed to fetch data.")
