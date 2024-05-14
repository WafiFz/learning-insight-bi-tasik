const { getJson } = require("serpapi");
const natural = require("natural");
const Sentiment = require("sentiment");

const tokenizer = new natural.WordTokenizer();
const sentiment = new Sentiment();

async function getNews(req, res) {
  const query = req.params.keyword || "inflasi tasikmalaya";
  const location = "id";

  try {
    const params = {
      api_key: process.env.SERP_API_KEY,
      engine: "google",
      q: query,
      google_domain: "google.com",
      gl: "id",
      hl: "id",
      num: "99999",
      tbm: "nws",
    };

    const data = await new Promise((resolve, reject) => {
      getJson(params, (result) => {
        if (result && result.news_results) {
          resolve(result);
        } else {
          reject("No news results found.");
        }
      });
    });

    const newsResults = data.news_results;
    let sentimentScores = [];
    let allTokens = [];

    newsResults.forEach((news) => {
      const text = `${news.title} ${news.snippet}`;
      const processedText = processText(text);
      allTokens = allTokens.concat(processedText);
      const sentimentResult = analyzeSentiment(processedText.join(" "));
      sentimentScores.push(sentimentResult.score);
    });

    const averageSentiment =
      sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

    res.json({
      averageSentiment,
      positiveNews: newsResults.filter(
        (news, index) => sentimentScores[index] > 0
      ),
      negativeNews: newsResults.filter(
        (news, index) => sentimentScores[index] < 0
      ),
      neutralNews: newsResults.filter(
        (news, index) => sentimentScores[index] === 0
      ),
      wordTokens: allTokens,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

function processText(text) {
  const tokens = tokenizer.tokenize(text);
  return tokens;
}

function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  return result;
}

module.exports = {
  getNews,
};
