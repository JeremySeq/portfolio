import requests

# === CONFIG ===
AUTHOR_ID = 28233
EXCLUSION_LIST = ["Star Wars Mod by JeremySeq"]

def get_author_data():
    url = f"https://www.modpackindex.com/api/v1/author/{AUTHOR_ID}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()["data"]
    except requests.RequestException as e:
        print(f"Error fetching author data: {e}")
        return None

def get_download_summary(author_data):
    total_downloads = 0
    mod_downloads = []

    for mod in author_data.get("mods", []):
        if mod["name"] in EXCLUSION_LIST:
            continue
        total_downloads += mod["download_count"]
        mod_downloads.append({
            "name": mod["name"],
            "downloads": mod["download_count"],
            "image": mod.get("thumbnail_url"),
            "link": mod.get("url")
        })
    mod_downloads.sort(key=lambda x: x["downloads"], reverse=True)
    return total_downloads, mod_downloads


if __name__ == "__main__":
    author_data = get_author_data()
    if author_data:
        total, all_projects = get_download_summary(author_data)
        print(f"Total Downloads: {total:,}\n")
        print("Downloads for each project:")
        for project in all_projects:
            print(f"- {project['name']}: {project['downloads']:,}")
            print(f"  Link: {project['link']}")
            print(f"  Image: {project['image']}")
    else:
        print("Failed to fetch author data.")
