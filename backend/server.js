const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();


app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "yash@1234", // ⚠️ apna MySQL password daal
  database: "billing_app"
});

db.connect((err) => {
  if (err) {
    console.log("DB Connection Error:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});


app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});




app.post("/customers", (req, res) => {
  const { id, name, address, pan, gst, is_active } = req.body;

  const sql = "INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)";

  db.query(sql, [id, name, address, pan, gst, is_active], (err) => {
    if (err) {
      console.log(err);
      return res.send("Error adding customer ❌");
    }
    res.send("Customer Added Successfully ✅");
  });
});


app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error fetching customers ❌");
    }
    res.json(result);
  });
});

app.post("/items", (req, res) => {
  const { name, price, gst } = req.body;

  const sql = "INSERT INTO items (name, price, gst) VALUES (?, ?, ?)";

  db.query(sql, [name, price, gst], (err) => {
    if (err) {
      console.log(err);
      return res.send("Error adding item ❌");
    }
    res.send("Item Added Successfully ✅");
  });
});


app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Error fetching items ❌");
    }
    res.json(result);
  });
});


function generateInvoiceId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return "INVC" + random;
}


app.post("/invoice", (req, res) => {
  const { customer_id, items } = req.body;

  const invoiceId = generateInvoiceId();

  let total = 0;

  
  items.forEach((item) => {
    total += item.price * item.quantity;
  });

  
  db.query(
    "SELECT gst FROM customers WHERE id = ?",
    [customer_id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Error fetching customer ❌");
      }

      const customerGST = result[0]?.gst;

      let gstAmount = 0;

    
      if (!customerGST) {
        gstAmount = total * 0.18;
      }

      const finalAmount = total + gstAmount;

      
      db.query(
        "INSERT INTO invoices VALUES (?, ?, ?, ?, ?)",
        [invoiceId, customer_id, total, gstAmount, finalAmount],
        (err) => {
          if (err) {
            console.log(err);
            return res.send("Error saving invoice ❌");
          }
        }
      );

      
      items.forEach((item) => {
        db.query(
          "INSERT INTO invoice_items (invoice_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
          [invoiceId, item.id, item.quantity, item.price]
        );
      });

      // Final Response
      res.json({
        message: "Invoice Created Successfully ✅",
        invoiceId,
        total,
        gstAmount,
        finalAmount
      });
    }
  );
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});