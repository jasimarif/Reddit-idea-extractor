require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const {startCronJobs} = require("./cron.js");

const PORT = process.env.PORT || 4000;

connectDB()

startCronJobs();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
