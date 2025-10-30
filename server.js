const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = "./leaderboard.json";

// Load or create leaderboard
let leaderboard = {};
if (fs.existsSync(DATA_FILE)) {
  leaderboard = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

// Get a player's highscore
app.get("/highscore/:playerId", (req, res) => {
  const { playerId } = req.params;
  const score = leaderboard[playerId] || 0;
  res.json({ highScore: score });
});

// Update highscore
app.post("/highscore", (req, res) => {
  const { playerId, score } = req.body;

  if (!playerId || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid request" });
  }

  const current = leaderboard[playerId] || 0;
  if (score > current) {
    leaderboard[playerId] = score;
    fs.writeFileSync(DATA_FILE, JSON.stringify(leaderboard, null, 2));
  }

  res.json({ success: true, highScore: leaderboard[playerId] });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Leaderboard API running on port ${PORT}`));
