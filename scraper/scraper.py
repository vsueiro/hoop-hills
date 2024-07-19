import re
import time
import requests
import pandas as pd
from bs4 import BeautifulSoup

# Extract game IDs from the specified table in the BeautifulSoup object.
def scrape_games_from_table(soup, table_id, game_type):
  game_ids = []
  table = soup.find('table', {'id': table_id})
  if not table:
    print(f'No {game_type} table found')
    return game_ids
  
  # Find all <td> elements with data-stat="box_score_text"
  tds = table.find_all('td', {'data-stat': 'box_score_text'})
  
  # Iterate over each <td> element to find <a> tags within them
  for td in tds:
    a_tag = td.find('a', href=True)
    if a_tag and a_tag['href'].startswith('/boxscores/'):
      game_id = a_tag['href'].split('/')[-1].replace('.html', '')
      game_ids.append({'id': game_id, 'type': game_type})
    
  return game_ids

# Scrape game IDs for a given team and season and return df
def get_ids_of_games(team_id, year):

  print(f'Getting ids of games for {team_id} in {year}')

  # URL of the team's games page on Basketball Reference
  url = f'https://basketball-reference.com/teams/{team_id}/{year}_games.html'

  print(url)

  game_ids = []

  # Send a GET request to the URL
  response = requests.get(url)
  if response.status_code != 200:
    print('Status was not 200')
    return pd.DataFrame()

  # Parse the HTML content
  soup = BeautifulSoup(response.content, 'html.parser')

  # Scrape regular season games
  game_ids.extend(scrape_games_from_table(soup, 'games', 'RS'))

  # Scrape playoff games
  game_ids.extend(scrape_games_from_table(soup, 'games_playoffs', 'PO'))

  # Convert the list of game IDs to a DataFrame
  game_ids_df = pd.DataFrame(game_ids)

  return game_ids_df

def clean_play_by_play_data(df, team_location):

  # Filter out rows containing specific texts in column "A"
  filter_texts = ['1st Q', '2nd Q', '3rd Q', '4th Q', '1st OT', '2nd OT', '3rd OT', '4th OT']
  df = df[~df['A'].astype(str).str.contains('|'.join(filter_texts))]

  # Remove duplicate rows, keeping the first occurrence
  df = df.drop_duplicates()

  # Drop columns 'C' and 'E'
  df.drop(['C', 'E'], axis=1, inplace=True)

  # Initialize the 'Quarter' column with 1
  df['Quarter'] = 1

  # Function to extract number from strings like "1st", "2nd", etc.
  def extract_number(text):
    match = re.search(r'\d+', text)
    return int(match.group()) if match else None

  # Iterate through the DataFrame rows
  current_quarter = 1
  for index, row in df.iterrows():
    if "Start of" in row['B']:
      quarter_num = extract_number(row['B'])
      if quarter_num:
        if "quarter" in row['B']:
          current_quarter = quarter_num
        elif "overtime" in row['B']:
          current_quarter = quarter_num + 4
    df.at[index, 'Quarter'] = current_quarter

  # Extract values from the first row to use as new column names
  new_column_names = df.iloc[0][['A', 'B', 'D', 'F']]

  # Rename the columns
  df.rename(
    columns={
      'A': new_column_names['A'],
      'B': new_column_names['B'],
      'D': new_column_names['D'],
      'F': new_column_names['F']
    }, inplace=True)

  # Drop the first row using iloc
  df = df.iloc[1:].reset_index(drop=True)

  # Iterate through the DataFrame rows and apply conditions
  previous_score = "0-0"  # Initialize the previous score
  for index, row in df.iterrows():
    second_column_value = row.iloc[1]  # Accessing the second column by its position

    if row['Time'] == "12:00.0" and row['Quarter'] == 1:
      df.at[index, 'Score'] = "0-0"
    elif "End of" in second_column_value or "Start of" in second_column_value:
      df.at[index, 'Score'] = previous_score
    elif pd.isna(df.at[index, 'Score']):
      df.at[index, 'Score'] = previous_score
    else:
      previous_score = df.at[index, 'Score']  # Update the previous score

  # Initialize columns 'TeamScore', 'OpponentScore', and 'PointDifference'
  df['TeamScore'] = 0
  df['OpponentScore'] = 0
  df['PointDifference'] = 0

  # Find the column index for team in the DataFrame
  team_index = df.columns.get_loc(team_location)

  # Determine the indices for team and the opponent based on the column index of team
  if team_index == 1:
    team = 0
    opponent = 1
  elif team_index == 3:
    team = 1
    opponent = 0

  # Process each row in the DataFrame
  for index, row in df.iterrows():
    # Split the 'Score' column value into two parts using '-' as the separator
    scores = row['Score'].split('-')
    # Convert the split values to integers immediately
    team_score = int(scores[team])
    opponent_score = int(scores[opponent])

    # Assign the converted scores to their respective columns
    df.at[index, 'TeamScore'] = team_score
    df.at[index, 'OpponentScore'] = opponent_score
    # Calculate and assign the point difference
    df.at[index, 'PointDifference'] = team_score - opponent_score

  # Constants
  quarter_seconds = 12 * 60
  ot_seconds = 5 * 60

  # Create "ElapsedTime" column and set to 0.0 initially
  df['ElapsedTime'] = 0.0

  # Iterate through each row
  for index, row in df.iterrows():
    # Split "Time" column value by ":"
    minutes, seconds = row['Time'].split(':')
    minutes = int(minutes)  # convert to int
    seconds = float(seconds)  # convert to float

    # Calculate remaining time in the quarter
    remaining_time_in_quarter = (minutes * 60) + seconds

    # Calculate elapsed time
    elapsed_quarters = 0
    if row['Quarter'] <= 4:
      elapsed_quarters = row['Quarter'] * quarter_seconds
    else:
      ots = row['Quarter'] - 4
      elapsed_quarters = (4 * quarter_seconds) + (ots * ot_seconds)

    elapsed_time = elapsed_quarters - remaining_time_in_quarter

    # Calculate total elapsed time
    df.at[index, 'ElapsedTime'] = elapsed_time

  return df


# Scrape play_by_play data based on game id and return df
def get_play_by_play_data( team_id, team_location, game_id, game_type, index, location_to_id ):

  print(f'{index}. Getting play-by-play for {team_id} in game {game_id} ({game_type})')

  # URL of the game’s play-by-play page on Basketball Reference
  url = f'https://basketball-reference.com/boxscores/pbp/{game_id}.html'
  
  # Send a request to the URL
  response = requests.get(url)

  # Check if the request was successful
  if response.status_code != 200:
    print('Status was not 200. Retrying in 10s')

    time.sleep(10)

    return get_play_by_play_data( team_id, team_location, game_id, game_type, index, location_to_id )
  
  # Parse the HTML content
  soup = BeautifulSoup(response.text, 'html.parser')

  # Find the table with id 'pbp'
  table = soup.find('table', {'id': 'pbp'})

  # One-liner check for the absence of table or information in the table
  table_is_empty = not table or not table.find_all('tr')

  # Check if the table was found
  if table_is_empty:
    print(f'No table information found for {game_id}')

    empty_df = pd.DataFrame({
      'id': [game_id],
      'type': [game_type],
      'opponent': '',
      'elapsedTime': [0.0],
      'event': [''],
      'teamScore': [0],
      'opponentScore': [0],
      'pointDifference': [0]
    })

    return empty_df

  rows = []

  try:
    # Process the table headers
    headers = [th.getText() for th in table.find_all('tr')[0].find_all(['th', 'td'])]
  except Exception as e:
    # Catch any other exception that wasn't caught by the specific except blocks
    print(e)
    return False

  # Initialize a list to hold all rows of the table
  rows.append(headers)

  # Process the table rows
  for tr in table.find_all('tr')[1:]:
    # Handle rows with 'rowspan'
    for cell in tr.find_all(['td', 'th'], rowspan=True):
      # Get the rowspan value and replicate the cell content across the spanned rows
      rowspan_val = int(cell['rowspan'])
      for i in range(1, rowspan_val):
        tr.find_next_siblings('tr')[i - 1].insert(len(tr.find_all(['td', 'th'])), cell)

    # Extract text from each cell, including both 'td' and 'th' elements
    row = [cell.getText() for cell in tr.find_all(['td', 'th'])]

    # Check for specific class in each cell and append relevant text
    event = ""
    for cell in tr.find_all(['td', 'th']):
      if 'bbr-play-leadchange' in cell.get('class', []):
        event = "Lead change"
        break
      elif 'bbr-play-tie' in cell.get('class', []):
        event = "Tie"
        break

    row.append(event)

    if row:
      rows.append(row)

  df = pd.DataFrame(rows, columns=['A','B','C','D','E','F','Event'])

  df = clean_play_by_play_data(df, team_location) 

  # Check the conditions and adjust the DataFrame accordingly
  if df.columns[1] == team_location:
    # Rename 2nd column to "Notes" and combine it with the 4th column
    df['Notes'] = df.iloc[:, 1].combine_first(df.iloc[:, 3])
    # Create new column "OpponentName" with the name of the 4th column
    df['OpponentName'] = df.columns[3]
    # Delete the 4th column
    df.drop(df.columns[[1, 3]], axis=1, inplace=True)

  elif df.columns[3] == team_location:
    # Rename 4th column to "Notes" and combine it with the 2nd column
    df['Notes'] = df.iloc[:, 3].combine_first(df.iloc[:, 1])
    # Create new column "OpponentName" with the name of the 2nd column
    df['OpponentName'] = df.columns[1]
    # Delete the 2nd column
    df.drop(df.columns[[1, 3]], axis=1, inplace=True)

  df['id'] = game_id
  df['type'] = game_type

  # Create minimal play-by-play dataset for data visualization

  # Create a DataFrame with the last row of each unique "id"
  last_per_id = df.drop_duplicates(subset='id', keep='last')

  # Add all rows with unique "Score" for each unique "id"
  unique_scores_per_id = df.drop_duplicates(subset=['id', 'Score'])

  # Combining the two DataFrames, removing duplicates again in case of overlap
  df = pd.concat([last_per_id, unique_scores_per_id]).drop_duplicates()

  # Remove columns: "Time", "Score", "Quarter", "Notes"
  df = df.drop(columns=['Time', 'Score', 'Quarter', 'Notes'])

  # Replace "Tie" with "T" and "Lead Change" with "LC" in the "Event" column
  df['Event'] = df['Event'].replace({'Tie': 'T', 'Lead change': 'LC'})

  # Find the index of the last occurrence of each unique 'id'
  last_rows = df.groupby('id').tail(1).index

  # Mark the final socre with an F in the event column
  df.loc[last_rows, 'Event'] = 'F'

  # Replace values in the "Opponent" column using the map
  df['OpponentName'] = df['OpponentName'].map(location_to_id)

  # Rename the columns to better fit JS
  df = df.rename(columns={
    'Event': 'event',
    'TeamScore': 'teamScore',
    'OpponentScore': 'opponentScore',
    'PointDifference': 'pointDifference',
    'ElapsedTime': 'elapsedTime',
    'OpponentName': 'opponent',
  })
  
  # print(df.head())

  return df
