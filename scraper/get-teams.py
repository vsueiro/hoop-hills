import requests
from bs4 import BeautifulSoup
import pandas as pd
import os

# Define the URL to scrape
url = "https://www.basketball-reference.com/teams/"

# Send a GET request to the URL
response = requests.get(url)

# Parse the HTML content of the page
soup = BeautifulSoup(response.content, 'html.parser')

# Get the table with id 'teams_active'
teams_table = soup.find('table', id='teams_active')

# Get the first <td> with data-stat="year_max" to determine the current season
current_season_td = teams_table.find('td', {'data-stat': 'year_max'})
current_season = current_season_td.text.strip()

# Create a list to collect team data
teams_data = []

# Get all <a> tags inside the table with id 'teams_active'
team_links = teams_table.find_all('a')

# Iterate over each <a> tag to extract team information
for link in team_links:
    href = link['href']
    team_id = href.split('/')[-2]  # Get the last 3 letters from the href attribute (excluding trailing slash)
    team_name = link.text.strip()
    team_nick = team_name.split()[-1]  # Get the last word of the team name

    # Append the extracted data to the list
    teams_data.append({'id': team_id, 'nick': team_nick, 'name': team_name})

# Create a DataFrame from the collected data
teams_df = pd.DataFrame(teams_data, columns=['id', 'nick', 'name'])

# Define the output directory and file path
output_dir = './public/data/teams/'
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, f'{current_season}.csv')

# Save the DataFrame to a CSV file
teams_df.to_csv(output_file, index=False)

print(f"Teams data saved to {output_file}")
