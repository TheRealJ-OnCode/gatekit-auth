const express = require("express");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
(async () => {
    await connectDB()
    app.use("/auth",authRoutes)
    app.get("/", (req, res) => {
        res.send("🚧 Gatekit API is currently under development. Stay tuned for upcoming features!");
    })
    app.listen(PORT, () => { console.log("Gatekit Demo Running on : ", PORT) });
})()



