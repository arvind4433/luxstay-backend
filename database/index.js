const dotenv = require("dotenv");

const mongoose = require("mongoose");
mongoose.connect(process.env.MongoDB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
  console.log("Connected to MongoDB");
});