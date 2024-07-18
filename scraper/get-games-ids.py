import os
import time
import requests
import pandas as pd
from bs4 import BeautifulSoup

# Extract game IDs from the specified table in the BeautifulSoup object.
def scrape_games_from_table(soup, table_id, game_type):
  game_ids = []
  table = soup.find('table', {'id': table_id})
  if table:
    # Find all <td> elements with data-stat="box_score_text"
    tds = table.find_all('td', {'data-stat': 'box_score_text'})
    
    # Iterate over each <td> element to find <a> tags within them
    for td in tds:
      a_tag = td.find('a', href=True)
      if a_tag and a_tag['href'].startswith('/boxscores/'):
        game_id = a_tag['href'].split('/')[-1].replace('.html', '')
        game_ids.append({'id': game_id, 'type': game_type})
        
  return game_ids

# Scrape game IDs for a given team and season, and save them to a CSV file.
def scrape_team_games(team_id, year):

  # URL of the team's games page on Basketball Reference
  url = f'https://basketball-reference.com/teams/{team_id}/{year}_games.html'
  
  game_ids = []

  # Send a GET request to the URL
  response = requests.get(url)
  if response.status_code == 200:

    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # Scrape regular season games
    game_ids.extend(scrape_games_from_table(soup, 'games', 'RS'))

    # Scrape playoff games
    game_ids.extend(scrape_games_from_table(soup, 'games_playoffs', 'PO'))

    # Convert the list of game IDs to a DataFrame
    game_ids_df = pd.DataFrame(game_ids)

    # Define the path to save the CSV file
    save_path = f'./public/data/seasons/{year}/{team_id}-ids.csv'

    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    # Save the DataFrame to a CSV file
    game_ids_df.to_csv(save_path, index=False)
    
    print(f'Saved game IDs for team {team_id} to {save_path}')

# Define the season year
year = '2024'

# Path to the CSV file containing team information
teams_file_path = './public/data/teams/2024-25.csv'

# Read the CSV file into a DataFrame
teams_df = pd.read_csv(teams_file_path)

# Iterate over each team in the DataFrame and scrape their game IDs
for _, team in teams_df.iterrows():
  team_id = team['id']
  scrape_team_games(team_id, year)
  # Add a delay of 2 seconds between requests
  time.sleep(2)
