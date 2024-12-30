const path = require("path");
const { connection } = require("../config/database");

let loggedUserinfo = null; // Stores information about the currently logged-in user

// Sends the user to the login page as the first page
const form = (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
};

const addWallet = (req, res) => {
  if (!loggedUserinfo) {
    return res.status(401).send("User not logged in");
  }

  const { walletName, initialBalance } = req.body;

  // Insert wallet data into the Wallets table
  const query = "INSERT INTO Wallets (wallet_name, initial_balance, userInfo_id) VALUES (?, ?, ?)";
  connection.query(query, [walletName, initialBalance, loggedUserinfo.userInfo_id], (err) => {
    if (err) {
      console.error("Error adding wallet:", err);
      return res.status(500).send("Error adding wallet");
    }

    // Redirect to index.html, keeping the user on the main page
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
  });
};

// Handles the creation of a new transaction for the logged-in user
const userTransaction = (req, res) => {
  if (!loggedUserinfo) {
    return res.status(401).send("User not logged in");
  }

  const { date, type, wallet_id, description, category, value } = req.body;

  const query = `
    INSERT INTO Transactions (Date, type, wallet_id, Description, Category, Value, userInfo_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    query,
    [date, type, wallet_id, description, category, value, loggedUserinfo.userInfo_id],
    (err) => {
      if (err) {
        console.error("Error inserting transaction:", err);
        return res.status(500).send("Error adding transaction");
      }
      res.sendFile(path.join(__dirname, "../frontend/index.html"));
    }
  );

  // Reads and updates the HTML file to display the logged-in user's name
  const fs = require("fs");
  const indexPath = path.join(__dirname, "../frontend/index.html");

  fs.readFile(indexPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      res.status(500).send("Error loading page");
      return;
    }

    // Updates the displayed name in the HTML file
    const updatedHTML = data.replace(
      "Hello User",
      `Hello ${loggedUserinfo.first_name}`,
    );

    res.send(updatedHTML);
  });
};

// Registers a new user in the database and redirects to the login page
const userInfo = (req, res) => {
  const { first_name, second_name, email, age, phone, eircode, password } =
    req.body;

  const add =
    "INSERT INTO mysql_table (first_name,second_name, email, age, phone, eircode, password) VALUES (?,?,?,?,?,?,?)";
  connection.query(
    add,
    [first_name, second_name, email, age, phone, eircode, password],
    (err) => {
      if (err) {
        console.log("Error inserting user:", err);
      }
      res.sendFile(path.join(__dirname, "../frontend/login.html")); // Redirects to the login page
    },
  );
};

// Retrieves all transactions associated with the logged-in user
const getTransactions = (req, res) => {
  if (!loggedUserinfo) {
    return res.status(401).send("User not logged in");
  }

  const query = `
    SELECT t.transaction_id, t.Date, t.type, w.wallet_name AS Wallet, t.Description, t.Category, t.Value
    FROM Transactions t
    LEFT JOIN Wallets w ON t.wallet_id = w.wallet_id
    WHERE t.userInfo_id = ?`;

  connection.query(query, [loggedUserinfo.userInfo_id], (err, results) => {
    if (err) {
      console.error("Error fetching transactions:", err);
      res.status(500).send("Error fetching transactions");
    } else {
      console.log("Fetched Transactions:", results); // Debug log
      res.json(results);
    }
  });
};

// Deletes a specific transaction by ID
const deleteTransaction = (req, res) => {
  const transactionId = req.params.id;
  const query = `DELETE FROM Transactions WHERE transaction_id = ?`;
  connection.query(query, [transactionId], (err, result) => {
    if (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).send("Error deleting transaction");
    } else {
      res.status(200).send("Transaction deleted successfully"); // Confirms deletion
    }
  });
};

// Retrieves all wallets associated with the logged-in user
const getWallets = (req, res) => {
  if (!loggedUserinfo) {
    return res.status(401).send("User not logged in");
  }

  const query = "SELECT wallet_id, wallet_name FROM Wallets WHERE userInfo_id = ?";
  connection.query(query, [loggedUserinfo.userInfo_id], (err, results) => {
    if (err) {
      console.error("Error fetching wallets:", err);
      return res.status(500).send("Error fetching wallets");
    }
    console.log("Fetched Wallets:", results); // Debug log
    res.json(results);
  });
};

// Authenticates the user and logs them into the system
const loginUser = (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM mysql_table WHERE email = ?";
  connection
    .promise()
    .query(query, [email])
    .then(([rows]) => {
      if (rows.length > 0) {
        const { password: __, ...user } = rows[0];
        if (rows[0].password !== password) {
          // Handles invalid credentials by updating the login page
          const fs = require("fs");
          const loginPath = path.join(__dirname, "../frontend/login.html");
          fs.readFile(loginPath, "utf8", (err, data) => {
            if (err) {
              console.error("Error reading HTML file:", err);
              res.status(500).send("Error loading page");
              return;
            }
            const updatedHTML = data.replace(
              "</form>",
              '<p style="color: red;">Invalid email or password</p></form>',
            );
            res.status(401).send(updatedHTML);
          });
          return;
        }
        loggedUserinfo = user; // Stores user information for session management

        // Updates the main page to greet the logged-in user
        const fs = require("fs");
        const indexPath = path.join(__dirname, "../frontend/index.html");
        fs.readFile(indexPath, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Error loading page");
            return;
          }
          const updatedHTML = data.replace(
            "Hello User",
            `Hello ${loggedUserinfo.first_name}`,
          );
          res.send(updatedHTML);
        });
      } else {
        // Handles non-existent user scenario
        const fs = require("fs");
        const loginPath = path.join(__dirname, "../frontend/login.html");
        fs.readFile(loginPath, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Error loading page");
            return;
          }
          const updatedHTML = data.replace(
            "</form>",
            '<p style="color: red;">Invalid email or password</p></form>',
          );

          res.status(401).send(updatedHTML);
        });
      }
    })
    .catch((err) => {
      console.error("Error checking user:", err);
      res.status(500).send("Server error");
    });
};

// Exports all functions for external usage
module.exports = {
  form,
  userInfo,
  userTransaction,
  getTransactions,
  loginUser,
  deleteTransaction,
  addWallet,
  getWallets
};
