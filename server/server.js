require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const openaiApiKey = process.env.OPENAI_API_KEY;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
