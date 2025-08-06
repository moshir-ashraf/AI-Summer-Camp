const path = require("path");
require('dotenv').config({path: path.join(__dirname, '../.env')});

const express = require("express");
const session = require("express-session");
const supabase = require("./supabase");

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

// Simple connection test
async function testConnection() {
  try {
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log("Database connection error:", error.message);
    } else {
      console.log("Connected to Supabase successfully");
    }
  } catch (error) {
    console.log("Supabase connection failed:", error.message);
  }
}

testConnection();

module.exports = app
