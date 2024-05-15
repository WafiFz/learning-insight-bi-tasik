const { getJson } = require("serpapi");
const natural = require("natural");
const Sentiment = require("sentiment");
const stemmer = natural.PorterStemmer;
const fs = require('fs');
const {
  google_search_news_data,
} = require("../example-response/google-search-news");

const tokenizer = new natural.WordTokenizer();
const sentiment = new Sentiment();

async function getNews(req, res) {
  const q = req.query.q || "inflasi tasikmalaya";
  const location = "id";

  try {
    const params = {
      api_key: process.env.SERP_API_KEY,
      engine: "google",
      q: q,
      google_domain: "google.com",
      gl: location,
      hl: location,
      num: "99999",
      tbm: "nws",
    };

    // const data = await new Promise((resolve, reject) => {
    //   getJson(params, (result) => {
    //     if (result && result.news_results) {
    //       resolve(result);
    //     } else {
    //       reject("No news results found.");
    //     }
    //   });
    // });

    const data = google_search_news_data;

    const newsResults = data.news_results;
    let sentimentScores = [];
    let allTokens = [];
    let positiveTokens = [];
    let negativeTokens = [];
    let neutralTokens = [];

    newsResults.forEach((news) => {
      const text = `${news.title} ${news.snippet}`;
      const processedText = processText(text);
      const sentimentResult = analyzeSentiment(processedText.join(" "));
      sentimentScores.push(sentimentResult.score);

      // Add tokens to respective arrays based on sentiment score
      const processedTextWordCloud = processTextWordCloud(text);
      if (sentimentResult.score > 0) {
        positiveTokens = positiveTokens.concat(processedTextWordCloud);
      } else if (sentimentResult.score < 0) {
        negativeTokens = negativeTokens.concat(processedTextWordCloud);
      } else {
        neutralTokens = neutralTokens.concat(processedTextWordCloud);
      }

      // Combine all tokens for overall wordcloud
      allTokens = allTokens.concat(processedTextWordCloud);
    });

    const averageSentiment =
      sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

    res.json({
      averageSentiment,
      positiveNews: {
        news: newsResults.filter((news, index) => sentimentScores[index] > 0),
        wordCloudTokens: positiveTokens,
      },
      negativeNews: {
        news: newsResults.filter((news, index) => sentimentScores[index] < 0),
        wordCloudTokens: negativeTokens,
      },
      neutralNews: {
        news: newsResults.filter((news, index) => sentimentScores[index] === 0),
        wordCloudTokens: neutralTokens,
      },
      wordTokens: allTokens,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

// function processText(text) {
//   const tokens = tokenizer.tokenize(text);
//   return tokens;
// }

// function analyzeSentiment(text) {
//   const result = sentiment.analyze(text);
//   return result;
// }

// Baca file teks yang berisi daftar kata positif dan negatif
function readWordList(filename) {
  return fs.readFileSync(filename, 'utf8').split('\n').map(word => word.trim());
}

function processText(text) {
  // Tokenisasi teks menjadi kata-kata
  const tokens = tokenizer.tokenize(text);
  
  // Lakukan stemming untuk setiap kata
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  return stemmedTokens;
}

function analyzeSentiment(text) {
  const positiveWords = readWordList('api/document/positive.txt');
  const negativeWords = readWordList('api/document/negative.txt');

  const words = text.split(' ');
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) {
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
    }
  });

  if (positiveCount > negativeCount) {
    return { result: 'positif', score: 1};
  } else if (negativeCount > positiveCount) {
    return { result: 'negatif', score: -1};
  } else {
    return { result: 'netral', score: 0};
  }
}

function normalizeText(text) {
  return text.toLowerCase();
}

function processTextWordCloud(text) {
  const normalizedText = normalizeText(text);
  const tokens = tokenizer.tokenize(normalizedText);
  const wordMap = {};

  tokens.forEach((token) => {
    if (wordMap[token]) {
      wordMap[token]++;
    } else {
      wordMap[token] = 1;
    }
  });

  const wordTokens = Object.entries(wordMap).map(([text, value]) => ({
    text,
    value,
  }));

  return wordTokens;
}

module.exports = {
  getNews,
};
