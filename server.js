const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

require("./database");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 5000;

const AuthRouter = require("./routes/AuthRoute");
app.use("/auth", AuthRouter);

const HotelRouter = require("./routes/hotelroutes");
app.use("/hotel", HotelRouter);

app.get("/", (req, res) => {
    return res.json({ status: true, message: "API is running" });
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});