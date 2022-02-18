const config = require("./config");
const twitter = require("twitter-lite");
const client = new twitter(config);
const open = require("open");

const screen_names = [
	"defi_frens",
	"WGMInterfaces",
	"thewalkingdood",
	"ToyzNFT",
	"ashrobinqt",
	"jpegscreenshots",
	"themetav3rse",
	"mv3nft",
	"CosmiqsNFT",
	"ColliderCraft",
	"CosmiqsNFT"
];
let openedUrls = [];
async function trackUsers() {
	let users = [];
	let followIds = "";
	let first = true;
	for (const screen_name of screen_names) {
		const user = await client.get("users/show", { screen_name: screen_name });
		if (user?.id_str) {
			users.push(user);

			if (!first) {
				followIds += ",";
			}

			followIds += user.id_str;
			first = false;
		}
	}
	console.log(followIds);
	const parameters = {
		follow: followIds,
	};

	const openBrowser = async (url) => {
		await open(url);
	};

	const stream = client
		.stream("statuses/filter", parameters)
		.on("start", (response) => console.log("start"))
		.on("data", (tweet) => {
			if (!tweet.retweeted_status && !tweet.in_reply_to_screen_name) {
				const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
				openBrowser(url);
			}
			if (tweet.entities.urls.length > 0) {
				tweet.entities.urls.forEach((url) => {
					if (
						url.expanded_url.includes("discord.") &&
						!openedUrls.includes(url.expanded_url)
					) {
						openedUrls.push(url.expanded_url);
						openBrowser(url.expanded_url);
						console.log(tweet);
					}
				});
			}
		})
		.on("ping", (ping) => console.log(ping))
		.on("error", (error) => console.log("error", error))
		.on("end", (response) => console.log("end"));
}

trackUsers().catch((err) => console.error(err));
