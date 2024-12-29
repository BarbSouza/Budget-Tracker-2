// Importing required modules and routes
const express = require("express");
const routes = require("./routes");
const { initDB } = require("./config/database");
require("dotenv").config();

const app = express();

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON data from requests
app.use(express.json());

// Middleware to serve static files from the project directory
app.use(express.static(__dirname));

// Register application routes
app.use(routes);

// Initialize the database connection
initDB();

// Start the server and listen on the port defined in the environment variables
app.listen(3000, () => {
  console.log(`Server running on port: 3000`);
});
