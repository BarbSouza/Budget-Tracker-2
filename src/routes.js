// Importing required modules and userController
const express = require("express");
const userController = require("./controllers/userController");
const { connection } = require("./config/database");

const routes = express();

// Route to serve the login page as the first page
routes.get("/", userController.form);

// Route to handle user registration and save user information in the database
routes.post("/submit", userController.userInfo);

// Route to authenticate a user and log them into the system
routes.post("/login", userController.loginUser);

// Route to add a new transaction to the database for the logged-in user
routes.post("/addTransaction", userController.userTransaction);

// Route to fetch all transactions for the logged-in user
routes.get("/transactions", userController.getTransactions);

// Route to delete a specific transaction based on its ID
routes.delete("/transactions/:id", userController.deleteTransaction);

// Route to add a new wallet to the database for the logged-in user
routes.post("/addWallet", userController.addWallet);

// Exporting the routes to be used in the main application
module.exports = routes;
