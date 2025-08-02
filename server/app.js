const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

require('dotenv').config({path: path.join(__dirname, '../.env')});

const app = express()
const router = require('./route')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(
  session({ secret: "MOSHIR_ASHRAF", saveUninitialized: true, resave: false })
);

app.set('view engine', 'ejs') 
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use('/', router)


mongoose
  .connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

module.exports = app
