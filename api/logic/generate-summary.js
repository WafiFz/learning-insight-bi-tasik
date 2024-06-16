const apiKey = process.env.GEMINI_API_KEY;
const apiUrl = process.env.GEMINI_API_URL + apiKey;

async function generateSummaries(req, res) {
  try {
    const data = req.body;
    
    const allNewsContent = prepareContent(data.allNews.news, "");
    const positiveNewsContent = prepareContent(
      data.positiveNews.news,
      "positif"
    );
    const negativeNewsContent = prepareContent(
      data.negativeNews.news,
      "negatif"
    );
    const neutralNewsContent = prepareContent(data.neutralNews.news, "netral");

    const allNewsSummary = await generateSummary(allNewsContent);
    const positiveNewsSummary = await generateSummary(positiveNewsContent);
    const negativeNewsSummary = await generateSummary(negativeNewsContent);
    const neutralNewsSummary = await generateSummary(neutralNewsContent);

    res.json({
      allNews: allNewsSummary,
      positiveNews: positiveNewsSummary,
      negativeNews: negativeNewsSummary,
      neutralNews: neutralNewsSummary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate summaries" });
  }
}

function prepareContent(dataNews, sentiment) {
  const quest =
    "Berikan rangkuman dengan Bahasa Indoneisa dari kumpulan berita ";

  const note = "catatan: tidak selalu setiap berita berkaitan";
  const news = dataNews
    .map((news) => `${news.title} : ${news.snippet}`)
    .join(" ");

  return quest + sentiment + ":" + news + "\n" + note;
}

const generateSummary = async (content) => {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: content,
          },
        ],
      },
    ],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`API returned an error: ${response.status}`);
  }

  const contentType = response.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("API response is not in JSON format");
  }

  const responseJson = await response.json();
  const summary = responseJson.candidates[0].content.parts[0].text;

  return summary;
};

module.exports = { generateSummaries, prepareContent, generateSummary };
