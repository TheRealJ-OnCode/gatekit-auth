const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("🚧 Gatekit API is currently under development. Stay tuned for upcoming features!");
})
app.listen(PORT, () => { console.log("Gatekit Demo Running on : ", PORT) });


