const express = require("express");
const app = express();
const port = 8832;
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 120,
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);
app.disable("x-powered-by");
app.use(cors("*"));

app.get("/suggest", (req, res) => {
	const { query, provider, apikey } = req.query;

	if (!query || !provider)
		return res.status(400).json({ error: "Missing query or provider" });

	if (provider !== "duckduckgo")
		if (provider !== "brave")
			return res.status(400).json({ error: "Invalid provider" });

	if (provider === "brave" && !apikey)
		return res.status(401).json({
			error: `Brave API key is required! If you dont want to use api key please use "duckduckgo" as provider`,
		});

	switch (provider) {
		case "duckduckgo":
			fetchDuckDuckGo(query, res);
			break;
		case "brave":
			return res
				.status(400)
				.json({ error: "Not implemented yet! Use 'duckduckgo'" });
	}
});

function fetchDuckDuckGo(query, res) {
	fetch(`https://duckduckgo.com/ac/?q=${query}`)
		.then((response) => response.json())
		.then((data) => {
			return res.status(200).json({ suggestions: data });
		})
		.catch((error) => {
			console.log(error);
			return res
				.status(500)
				.json({ error: "Something went wrong! please try again" });
		});
}

function fetchBrave(query, apikey) {
	return "todo";
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
