const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();


mongoose.connect(process.env.MongoDB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.on("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const AuthRouter = require("./routes/AuthRoute"); 
app.use("/auth", AuthRouter);

const HotelRouter = require("./routes/hotelroutes"); 
app.use("/hotel", HotelRouter); 

app.get("/", (req, res) => {
  return res.json({ status: true, message: "API Server Working!" });
});


const HOST = "0.0.0.0";
const PORT = 5000;

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
