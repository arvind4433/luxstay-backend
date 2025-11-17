const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");


mongoose.connect("mongodb://127.0.0.1:27017/room-booking")
  .then(() => console.log("MongoDB Connected: room-booking"))
  .catch(err => console.log("DB Connection Error:", err));

const app = express();


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const AuthRouter = require("./routes/AuthRoute"); 
app.use("/auth", AuthRouter);


app.get("/", (req, res) => {
  return res.json({ status: true, message: "API Server Working!" });
});


const HOST = "127.0.0.1";
const PORT = 5000;

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
