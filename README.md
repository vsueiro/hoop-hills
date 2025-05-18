# Hoop Hills

Explore the peaks and valleys of NBA game leads: this 3D data visualization shows every moment a team was leading 🟦 or trailing 🟥 during an entire season.

## Scraper

I recommend using `asdf` to manage Python versions (I’m currently using `3.13`). Run `python -m pip install -r requirements.txt` to install dependencies.

Run `python scraper/get-games.py` to (respectfully) scrape play-by-play data from [basketball-reference.com](https://www.basketball-reference.com/).

Tweak the options object in the `get-games.py` file to get a specific season, like `options['year'] = [2025]`.

If there are games already scraped, the scraper will skip those and append only missing ones to each team’s `.csv` file.
