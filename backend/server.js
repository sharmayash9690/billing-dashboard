const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "billing_db"
});

// Test API
app.get("/", (req, res) => {
  res.send("Backend Running");
});
// Get Customers
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers WHERE is_active = 1", (err, result) => {
    res.send(result);
  });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});