import requests
import time

def get_author_data_modpackindex(author_id):
    url = f"https://www.modpackindex.com/api/v1/author/{author_id}"
    try:
        resp = requests.get(url)
        resp.raise_for_status()
        return resp.json()["data"]
    except requests.RequestException as e:
        print(f"Error fetching Modpack Index author data: {e}")
        return None

def search_modrinth_project(mod_name):
    search_url = "https://api.modrinth.com/v2/search"
    project_url_template = "https://api.modrinth.com/v2/project/{}"

    params = {
        "query": mod_name,
        "limit": 1
    }
    try:
        resp = requests.get(search_url, params=params)
        resp.raise_for_status()
        results = resp.json()
        hits = results.get("hits", [])
        if hits:
            project = hits[0]
            project_id = project["project_id"]

            # Fetch project details to verify author
            proj_resp = requests.get(project_url_template.format(project_id))
            proj_resp.raise_for_status()
            proj_data = proj_resp.json()

            # Check authors list for username "JeremySeq"
            authors = proj_data.get("authors", [])
            for author in authors:
                if author.get("username", "").lower() == "jeremyseq":
                    # Author matches, return project id and downloads
                    return project_id, proj_data.get("downloads", 0)
            # If no matching author found
            return None, 0
        return None, 0
    except requests.RequestException as e:
        print(f"Error searching Modrinth for '{mod_name}': {e}")
        return None, 0

def get_modrinth_downloads_for_mods(mod_names):
    modrinth_data = {}
    for name in mod_names:
        project_id, downloads = search_modrinth_project(name)
        modrinth_data[name] = downloads
        # To avoid hitting rate limits or spamming API too fast
        time.sleep(0.5)
    return modrinth_data

def combine_downloads(modpackindex_mods, modrinth_data):
    combined = []
    for mod in modpackindex_mods:
        name = mod["name"]
        curseforge_dl = mod["download_count"]
        modrinth_dl = modrinth_data.get(name, 0)
        combined.append({
            "name": name,
            "curseforge_downloads": curseforge_dl,
            "modrinth_downloads": modrinth_dl,
            "total_downloads": curseforge_dl + modrinth_dl
        })
    return combined

# === CONFIG ===
author_id = 28233  # your Modpack Index author ID here

# === RUN ===
author_data = get_author_data_modpackindex(author_id)
if author_data:
    curseforge_mods = author_data.get("mods", [])
    mod_names = [mod["name"] for mod in curseforge_mods]

    print(f"Searching Modrinth for {len(mod_names)} mods...")

    modrinth_downloads = get_modrinth_downloads_for_mods(mod_names)

    combined_stats = combine_downloads(curseforge_mods, modrinth_downloads)

    # Sort by total downloads desc
    combined_stats.sort(key=lambda x: x["total_downloads"], reverse=True)

    print("\nCombined mod downloads (CurseForge + Modrinth):\n")
    for mod in combined_stats:
        print(f"{mod['name']}: CurseForge={mod['curseforge_downloads']:,} + Modrinth={mod['modrinth_downloads']:,} = Total={mod['total_downloads']:,}")

    total_curseforge = sum(mod["curseforge_downloads"] for mod in combined_stats)
    total_modrinth = sum(mod["modrinth_downloads"] for mod in combined_stats)
    total_all = total_curseforge + total_modrinth

    print(f"\nTotals:\nCurseForge: {total_curseforge:,}\nModrinth: {total_modrinth:,}\nCombined: {total_all:,}")
else:
    print("Failed to fetch author data from Modpack Index.")
