import os
import time
import pandas as pd
from scraper import get_ids_of_games, get_play_by_play_data

# Settings
options = {}

options['year'] = 2024 # Season (ending year) to be scraped
options['delay'] = 4 # Seconds to be waited between requests
options['teams_path'] = './public/data/teams/2024-25.csv' # Location to read CSV file
options['seasons_path'] = './public/data/seasons/' # Location to write games for team and season 

# Dataframes
teams = pd.read_csv(options['teams_path'])

# For each NBA team
for _, team in teams.iterrows():

  # TEMP: Filter teams
  # if team['id'] in ['ATL','BOS']:
  #   continue

  # Create empty dataframe
  columns = ['id', 'type', 'opponent', 'elapsedTime', 'event', 'teamScore', 'opponentScore', 'pointDifference']
  games_df = pd.DataFrame(columns=columns)

  # Scrape ids of all games from that team 
  games_ids = get_ids_of_games( team['id'], options['year'] )

  time.sleep(options['delay'])

  # For each game
  for index, game in games_ids.iterrows():

    # Create a dictionary mapping from the 'location' to 'code'
    location_to_id = teams.set_index('location')['id'].to_dict()

    # Scrape play-by-play data
    play_by_play_df = get_play_by_play_data( team['id'], team['location'], game['id'], game['type'], index, location_to_id )

    # Append data to games_df
    games_df = pd.concat([games_df, play_by_play_df], ignore_index=True)

    time.sleep(options['delay'])

  # Sort by "id" and then by "ElapsedTime"
  games_df = games_df.sort_values(by=['id', 'elapsedTime'])

  print(games_df.head())

  # Save the dataframe for that team
  dir = f"{options['seasons_path']}{options['year']}"
  os.makedirs(dir, exist_ok=True)
  games_df.to_csv(f"{dir}/{team['id']}.csv", index=False)
  print(f"Saved {dir}/{team['id']}.csv")