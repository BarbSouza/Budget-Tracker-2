// Function to show a modal by setting its display to "block"
function showModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

// Function to close a modal by setting its display to "none"
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Event listener to display the "Add Transaction" modal when the button is clicked
document
  .getElementById("addTransactionBtn")
  .addEventListener("click", function () {
    showModal("addTransactionModal");
  });

  // Show Wallet Modal
document.getElementById("addWalletBtn").addEventListener("click", function () {
  showModal("addWalletModal");
});

// Adds event listeners to all "Edit" buttons to show the "Edit Transaction" modal dynamically
document.querySelectorAll(".edit-btn").forEach((button) => {
  button.addEventListener("click", function () {
    showModal("editTransactionModal");
  });
});

// Executes once the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Fetches transactions from the server and displays them in a table
  fetch("/transactions")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById("transactionTableBody");
      tableBody.innerHTML = "";
      let total = 0;

      // Iterates over the transactions to create table rows for each
      data.forEach((transaction) => {
        const row = document.createElement("tr");
        const transactionValue =
          transaction.type === "Expense"
            ? -Math.abs(transaction.Value)
            : Math.abs(transaction.Value);
        total += transactionValue;

        // Appends transaction details into the row
        row.innerHTML = `
          <td>${new Date(transaction.Date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}</td>
          <td>${transaction.type}</td>
          <td>${transaction.Wallet}</td>
          <td>${transaction.Description}</td>
          <td>${transaction.Category}</td>
          <td>${transactionValue.toFixed(2)}</td>
          <td>
            <button class="button edit-btn" data-id="${transaction.transaction_id}">Remove</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      // Adds a summary row displaying the total of all transactions
      const totalRow = document.createElement("tr");
      totalRow.innerHTML = `
        <td colspan="5" style="text-align: right; font-weight: bold;">Total</td>
        <td style="font-weight: bold;">${total.toFixed(2)}</td>
        <td></td>
      `;
      tableBody.appendChild(totalRow);

      // Adds event listeners to "Remove" buttons to delete transactions
      const deleteButtons = document.querySelectorAll(".edit-btn");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const transactionId = button.getAttribute("data-id");

          // Sends a DELETE request to remove a transaction
          fetch(`/transactions/${transactionId}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (response.ok) {
                // Removes the transaction row from the table and refreshes the page
                button.closest("tr").remove();
                window.location.href = "/frontend/index.html";
                console.log("Transaction deleted successfully");
              } else {
                console.error("Failed to delete transaction");
              }
            })
            .catch((error) =>
              console.error("Error deleting transaction:", error),
            );
        });
      });
    })
    .catch((error) => console.error("Error fetching transactions:", error));
});

// Function to validate the user registration form
function validateForm() {
  // Get form values
  let firstName = document.getElementById("first_name").value.trim();
  let secondName = document.getElementById("second_name").value.trim();
  let email = document.getElementById("email").value.trim();
  let age = document.getElementById("age").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let eircode = document.getElementById("eircode").value.trim();
  let password = document.getElementById("password").value.trim();

  // Regular expressions for input validation
  let nameRegex = /^[a-zA-Z0-9]{1,20}$/;
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let phoneRegex = /^\d{10}$/;
  let eircodeRegex = /^[A-Z][0-9][0-9W][A-Z0-9]{4}$/;
  let passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  // Validation checks for each field
  if (!nameRegex.test(firstName)) {
    alert("First name must be alphanumeric and up to 20 characters.");
    return false;
  }
  if (!nameRegex.test(secondName)) {
    alert("Second name must be alphanumeric and up to 20 characters.");
    return false;
  }
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }
  if (isNaN(age) || age <= 0) {
    alert("Please enter a valid age.");
    return false;
  }
  if (!phoneRegex.test(phone)) {
    alert("Phone number must contain 10 numeric characters.");
    return false;
  }
  if (!eircodeRegex.test(eircode)) {
    alert(
      "Eircode must follow the format: letter, followed by number, number or W, followed by 4 alphanumeric characters.",
    );
    return false;
  }
  if (!passwordRegex.test(password)) {
    alert(
      "Password must have at least one lowercase, one uppercase letter, one number, one special character, and be at least 8 characters long.",
    );
    return false;
  }
  return true; // Form is valid
}
