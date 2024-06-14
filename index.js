const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const cors = require("cors");
const port = process.env.PORT;
const tribunnews = require("./api/tribunnews");
const cnnindonesia = require("./api/cnnindonesia");
const tempo = require("./api/tempo");
const kompas = require("./api/kompas");
const liputan6 = require("./api/liputan6");
const li = require("./api/logic/learning-insight");
const summary = require("./api/logic/generate-summary");

app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const data = {
    message: "Semua data hasil dari scraping",
    api: [
      {
        name: "Tribunnews",
        all: "/tribunnews",
        section: [
          "/tribunnews/news",
          "/tribunnews/regional",
          "/tribunnews/nasional",
          "/tribunnews/internasional",
          "/tribunnews/bisnis",
          "/tribunnews/sport",
          "/tribunnews/seleb",
          "/tribunnews/lifestyle",
          "/tribunnews/kesehatan",
        ],
        detail: "/tribunnews/:slug",
        search: "/search/tribunnews/:keyword",
      },
      {
        name: "CNN Indonesia",
        all: "/cnnindonesia",
        section: [
          "/cnnindonesia/nasional",
          "/cnnindonesia/internasional",
          "/cnnindonesia/ekonomi",
          "/cnnindonesia/olahraga",
          "/cnnindonesia/hiburan",
          "/cnnindonesia/gaya-hidup",
          "/cnnindonesia/teknologi",
        ],
        detail: "/cnnindonesia/:slug",
      },
      {
        name: "Tempo",
        all: "/tempo",
        section: [
          "/tempo/nasional",
          "/tempo/dunia",
          "/tempo/metro",
          "/tempo/bisnis",
          "/tempo/olahraga",
          "/tempo/bola",
          "/tempo/gaya",
          "/tempo/travel",
          "/tempo/otomotif",
          "/tempo/tekno",
        ],
        detail: "/tempo/:slug",
      },
      {
        name: "Kompas",
        all: "/kompas",
        section: [
          "/kompas/megapolitan",
          "/kompas/regional",
          "/kompas/nasional",
          "/kompas/global",
          "/kompas/money",
          "/kompas/bola",
          "/kompas/tekno",
          "/kompas/lifestyle",
          "/kompas/health",
          "/kompas/otomotif",
        ],
        detail: "/kompas/:slug",
      },
      {
        name: "Liputan 6",
        all: "/liputan6",
        section: [
          "/liputan6/news",
          "/liputan6/crypto",
          "/liputan6/saham",
          "/liputan6/bisnis",
          "/liputan6/bola",
          "/liputan6/showbiz",
          "/liputan6/tekno",
          "/liputan6/cek-fakta",
          "/liputan6/islami",
          "/liputan6/regional",
        ],
        detail: "/liputan6/:slug",
      },
    ],
  };
  res.end(JSON.stringify(data));
});

app.get("/tribunnews", async (req, res) => {
  var result = await tribunnews.getData("news");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/tribunnews/:cat", async (req, res) => {
  var result = await tribunnews.getData(req.params.cat || "news");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/tribunnews/:cat/:y/:m/:d/:slug", async (req, res) => {
  var result = await tribunnews.getDetail(
    `${req.params.cat}/${req.params.y}/${req.params.m}/${req.params.d}/${req.params.slug}`
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/cnnindonesia", async (req, res) => {
  var result = await cnnindonesia.getData("");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/cnnindonesia/:cat", async (req, res) => {
  var result = await cnnindonesia.getData(req.params.cat || "");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/cnnindonesia/:cat/:id/:slug", async (req, res) => {
  var result = await cnnindonesia.getDetail(
    `${req.params.cat}/${req.params.id}/${req.params.slug}`
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/tempo", async (req, res) => {
  var result = await tempo.getData("");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/tempo/:cat", async (req, res) => {
  var result = await tempo.getData(req.params.cat || "");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/tempo/:cat/:read/:id/:slug", async (req, res) => {
  var result = await tempo.getDetail(
    `${req.params.cat}`,
    `${req.params.read}/${req.params.id}/${req.params.slug}`
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/kompas", async (req, res) => {
  var result = await kompas.getData("");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/kompas/:cat", async (req, res) => {
  var result = await kompas.getData(req.params.cat || "");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/kompas/:cat/:read/:y/:m/:d/:id/:slug", async (req, res) => {
  var result = await kompas.getDetail(
    `${req.params.cat}`,
    `${req.params.read}/${req.params.y}/${req.params.m}/${req.params.d}/${req.params.id}/${req.params.slug}`
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/liputan6", async (req, res) => {
  var result = await liputan6.getData("");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/liputan6/:cat", async (req, res) => {
  var result = await liputan6.getData(req.params.cat || "");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/liputan6/:cat/:read/:id/:slug", async (req, res) => {
  var result = await liputan6.getDetail(
    `${req.params.cat}/${req.params.read}/${req.params.id}/${req.params.slug}`
  );
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/search/tribunnews/:keyword", async (req, res) => {
  var result = await tribunnews.getDataByKey(req.params.keyword || "");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(result));
});

app.get("/search/google", li.getNews);

app.post("/news/summaries", summary.generateSummaries);

app.listen(process.env.PORT || port, () => {
  console.log(`Web app listening on port ${port}`);
});

module.exports = app;
