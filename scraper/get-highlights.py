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