import os
import time
import pandas as pd
from scraper import get_ids_of_games, get_play_by_play_data

# Settings
options = {}

options['year'] = [1997] # Seasons (ending year) to be scraped (newest to oldest works)
options['delay'] = 4 # Seconds to be waited between requests
options['seasons_path'] = './data/seasons/' # Location to write games for team and season
options['teams_path'] = './data/teams/' # Location to read CSV file

# TODO: Generate list automatically based on existing files in teams/
options['teams_since'] = [ # List files of fixed teams
  2015, # Current for 2026-27 seasons
  2014,
  2013,
  2009,
  2008,
  2006,
  2005,
  2003,
  2002,
  1998,
  1996,
  1990,
]

# Define logic for picking the right teams depending on season year
def get_team_file(year):

  # Ensure list is sorted  
  options['teams_since'].sort(reverse=True)

  # Assume no match is found (pick oldest team list by default)
  match = options['teams_since'][-1]

  # Get teams that existed on target year
  for since_year in options['teams_since']:
    if since_year <= year:
      match = since_year
      break

  print(f'Matched team list since {match}')

  # Build file name for CSV 
  team_filename = f"{options['teams_path']}since-{match}.csv"
  return team_filename

# Create or clear error log file
with open("errors.txt", "w") as error_file:
  pass # This does nothing, effectively clearing the file

# Extract the years from the list
years = options['year']

# Determine start and stop years based on the number of elements in the list
start = years[0]
stop = years[-1] if len(years) > 1 else years[0]

# Determine the step value based on the order of the years
step = -1 if start > stop else 1

# Loop through the range of years
for year in range(start, stop + step, step): 

  # Get team filename based on current year 
  team_file = get_team_file(year)

  if team_file is None:
    print(f'No team data found for season ending in year {year}')
    continue
  
  # Read list of teams
  teams = pd.read_csv(team_file)

  # For each NBA team
  for _, team in teams.iterrows():

    # TEMP: Filter teams
    # if team['id'] not in ['NOK']:
    #   continue

    # Get target filename
    dir = f"{options['seasons_path']}{year}"
    filename = f"{dir}/{team['id']}.csv"

    # Check if file already exists
    file_exists = os.path.exists(filename)
    existing_games_df = False
    if file_exists:
      existing_games_df = pd.read_csv(filename)

    # Create empty dataframe
    columns = ['id', 'type', 'opponent', 'elapsedTime', 'event', 'teamScore', 'opponentScore', 'pointDifference']
    games_df = pd.DataFrame(columns=columns)

    # Scrape ids of all games from that team 
    games_ids = get_ids_of_games( team['id'], year )

    time.sleep(options['delay'])

    # For each game
    for index, game in games_ids.iterrows():

      # Create a dictionary mapping from the 'location' to 'code'
      location_to_id = teams.set_index('location')['id'].to_dict()

      # Skip scraping if game id is already in the dataset
      if file_exists and game['id'] in existing_games_df['id'].values:
        print(f"{game['id']} already exists in {filename}")
        continue

      # Scrape play-by-play data
      play_by_play_df = get_play_by_play_data( team['id'], team['location'], game['id'], game['type'], index, location_to_id )

      # Append data to games_df
      games_df = pd.concat([games_df, play_by_play_df], ignore_index=True)

      time.sleep(options['delay'])

    # Combine existing games with newly scraped ones
    if file_exists:
      games_df = pd.concat([existing_games_df, games_df], ignore_index=True)

    # Sort by "id" and then by "ElapsedTime"
    games_df = games_df.sort_values(by=['id', 'elapsedTime'])

    print(games_df.head())

    # Save the dataframe for that team
    os.makedirs(dir, exist_ok=True)
    games_df.to_csv(filename, index=False)
    print(f"Saved {filename}")