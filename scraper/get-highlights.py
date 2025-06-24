import os
import re
import time
import random
import random
import urllib.parse
import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import quote_plus

SEASON_DIR = "./data/seasons"
HIGHLIGHTS_DIR = "./data/highlights"
YOUTUBE_SEARCH_BASE = "https://www.youtube.com/@NBA/search"

df_teams = pd.read_csv('./data/teams/2024-25.csv')

os.makedirs(HIGHLIGHTS_DIR, exist_ok=True)

def get_game_ids_from_season(season_path):
    game_ids = set()
    for file_name in os.listdir(season_path):
        if file_name.endswith(".csv"):
            file_path = os.path.join(season_path, file_name)
            try:
                df = pd.read_csv(file_path)
                game_ids.update(df['id'].dropna().unique())
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    return list(game_ids)

def get_nick(team_id):
    return df_teams.loc[df_teams["id"] == team_id, "nick"].iloc[0]

def build_youtube_query(game_id, home, away):
    date_part = game_id[:8]
    game_date = datetime.strptime(date_part, "%Y%m%d")
    date = game_date.strftime("%B %d, %Y")

    AWAY = get_nick(away).upper()
    HOME = get_nick(home).upper()

    query = quote_plus(f'{AWAY} at {HOME} | FULL GAME HIGHLIGHTS | {date}')
    url = f'{YOUTUBE_SEARCH_BASE}?query={query}'
    return url

def extract_video_id_from_html(html):
    try:
        match = re.search(r'\[{"itemSectionRenderer":{"contents":\[{"videoRenderer":{"videoId":"(.*?)"', html)
        return match.group(1) if match else None
    except:
        return None

def scrape_video_id(search_url):
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        resp = requests.get(search_url, headers=headers)
        if resp.status_code == 200:
            return extract_video_id_from_html(resp.text)
    except Exception as e:
        print(f"Error scraping {search_url}: {e}")
    return None

# Part 1: Create highlights CSVs with home and away columns
for season in os.listdir(SEASON_DIR):
    season_path = os.path.join(SEASON_DIR, season)
    if os.path.isdir(season_path):
        game_rows = []

        for file_name in os.listdir(season_path):
            if file_name.endswith(".csv"):
                file_path = os.path.join(season_path, file_name)
                team = os.path.splitext(file_name)[0]  # Strip '.csv'

                try:
                    df = pd.read_csv(file_path)
                    df = df.dropna(subset=["id", "opponent"])
                    df_unique = df.drop_duplicates(subset="id", keep="first")

                    for _, row in df_unique.iterrows():
                        game_id = row["id"]
                        opponent = row["opponent"]
                        home_id = game_id[-3:]  # last 3 chars of id

                        if team == home_id:
                            home = team
                            away = opponent
                        else:
                            home = opponent
                            away = team

                        game_rows.append((game_id, home, away))

                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

        highlight_df = pd.DataFrame(game_rows, columns=["id", "home", "away"])
        highlight_df = highlight_df.drop_duplicates(subset="id", keep="first")
        highlight_df["video"] = ""

        out_path = os.path.join(HIGHLIGHTS_DIR, f"{season}.csv")
        highlight_df.to_csv(out_path, index=False)
        print(f"Saved highlights for {season} with {len(highlight_df)} unique game IDs.")

# Part 2: Scrape YouTube for video IDs
for file_name in sorted(os.listdir(HIGHLIGHTS_DIR), reverse=True):

    # TEMP
    if file_name != '2025.csv':
      continue

    if file_name.endswith(".csv"):
        path = os.path.join(HIGHLIGHTS_DIR, file_name)
        df = pd.read_csv(path)
        for i, row in df.iterrows():
            if pd.notna(row["video"]) and row["video"]:
                continue
            search_url = build_youtube_query(row["id"], row["home"], row["away"])
            if not search_url:
                continue
            print(f"Searching for game {row["id"]}: {search_url}")
            video_id = scrape_video_id(search_url)
            if video_id:
                df.at[i, "video"] = video_id
                print(f" → Found video ID: {video_id}")
            else:
                print(" → No video found.")
            time.sleep(random.uniform(4, 6))
        df.to_csv(path, index=False)
        print(f"Updated {file_name} with video links.")

'''

# Create empty highlights csv with unique ids

For each directory (like `2025/`, `2024/`, `2023/`) in `data/seasons/` as folder_name:
	
	Create empty dataframe with 2 columns: `id` and `video`

	For each `*.csv` file (like `ATL.csv`, `BOS.csv`, `BRK.csv`) as file_name inside folder_name:
		Parse csv
		Get unique entries of `id` column
		Add entries to `id` column of dataframe

	Exclude duplicates in dataframe
	Save dataframe as `data/highlights/{folder_name}.csv`
	


# Find matching highlight videos by NBA on YouTube

For each `*.csv` file in `data/highlights/` as dataframe:

	For each `id` in dataframe:

		If it’s matching `video` is already filled:
			Continue to next id

		# From game id, build YouTube search URL like "https://www.youtube.com/@NBA/search?query=PACERS+at+THUNDER+%7C+FULL+GAME+HIGHLIGHTS+%7C+Jun+22%2C+2025"

        # Get date from ID, like "June 22, 2025"

        # Get home team, like "PACERS"
        const home = this.app.world.summaries.getNick(group.userData.home ? this.team : group.userData.opponent);

        # Get away team, like "THUNDER"
        const away = this.app.world.summaries.getNick(group.userData.home ? group.userData.opponent : this.team);

        # Build query
        const query = `${away.toUpperCase()} at ${home.toUpperCase()} | FULL GAME HIGHLIGHTS | ${date}`;

        # Add query to URL
        const url = new URL("https://www.youtube.com/@NBA/search");
        url.searchParams.set("query", query);

        # Convert characters to URL-friendly string (like | is %7C and space is +)
        console.log(url.toString());

		# Access URL, with a delay

		# Get first result, by parsing URL as text and finding this match:
		`[{"itemSectionRenderer":{"contents":[{"videoRenderer":{"videoId":"***********"`

		# Save the 11-characters string represented by * symbols in the matching `video` column.

		# Add result link to dataframe, in `video` column

	Save updated CSV

'''