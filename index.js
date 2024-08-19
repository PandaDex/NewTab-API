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

	if (provider === "brave" && !apikey)
		return res.status(401).json({
			error: `Brave API key is required! If you dont want to use api key please use "duckduckgo" as provider`,
		});

	switch (provider) {
		case "duckduckgo":
			fetchDuckDuckGo(query, res);
			break;
		case "brave":
			fetchBrave(query, res, apikey);
			break;
		default:
			return res.status(400).json({ error: "Invalid provider" });
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

function fetchBrave(query, res, apikey) {
	fetch(
		`https://api.search.brave.com/res/v1/suggest/search?q=${query}&country=all&count=8`,
		{
			headers: {
				Accept: "application/json",
				"Accept-Encoding": "gzip",
				"X-Subscription-Token": apikey,
			},
		},
	)
		.then((response) => response.json())
		.then(async (data) => {
			const tempdata = [];
			if (Array.isArray(data) && data.length === 0)
				return res.status(200).json({ suggestions: [] });
			data.results.forEach((element) => {
				tempdata.push({
					phrase: element.query,
				});
			});
			return res.status(200).json({ suggestions: tempdata });
		})
		.catch((error) => {
			console.log(error);
			return res
				.status(500)
				.json({ error: "Something went wrong! please try again" });
		});
}

app.listen(port, () => console.log(`Server started on ${port}!`));
