const express = require("express");
const app = express();
const db = require('./api/models/db')
const routes = require("./api/controllers")
const PORT = 3001
const morgan = require("morgan");
const cors = require('cors')
const cookieParser = require("cookie-parser");


require("dotenv").config();

app.use(cors({
	origin: 'https://tmbd-p5-front.vercel.app',
	credentials: true
})) // esta librería es para poder trabajar front con back en localhost
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());


// Express Routing
app.use("/api", routes);


app.use(function (err, req, res, next) {
    console.error(err, err.stack);
    res.status(500).send(err);
});

db.sync({force: false}).then(() => {
  app.listen(PORT, () => console.log(`SERVER ON PORT: ${PORT}`));
});

module.exports = app;
