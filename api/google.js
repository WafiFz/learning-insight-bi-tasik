const dotenv = require("dotenv");
dotenv.config();

const { getJson } = require("serpapi");

async function getNews(query, location = "id") {
  getJson(
    {
      api_key: process.env.SERP_API_KEY,
      engine: "google",
      q: query,
      google_domain: "google.com",
      gl: "id",
      hl: "id",
      num: "99999",
      tbm: "nws",
    },
    (json) => {
      console.log(json);
    }
  );
}
