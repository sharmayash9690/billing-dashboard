import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [invoice, setInvoice] = useState(null);

  
  useEffect(() => {
    axios.get("http://localhost:5000/customers")
      .then(res => setCustomers(res.data))
      .catch(err => console.log(err));

    axios.get("http://localhost:5000/items")
      .then(res => setItems(res.data))
      .catch(err => console.log(err));
  }, []);

  
  const handleQtyChange = (item, qty) => {
    if (qty <= 0) return;

    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: qty } : i
        );
      } else {
        return [...prev, { ...item, quantity: qty }];
      }
    });
  };

  
  const handleGenerate = () => {
    if (!selectedCustomer) {
      alert("Please select customer");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please add item quantity");
      return;
    }

    axios.post("http://localhost:5000/invoice", {
      customer_id: selectedCustomer,
      items: selectedItems
    })
    .then(res => {
      setInvoice(res.data);

      
      setSelectedCustomer("");
      setSelectedItems([]);
    })
    .catch(err => console.log(err));
  };

  return (
    <div style={{ padding: "20px" }}>
       <h1>💼 Billing Dashboard</h1>

      {}
      <select
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
      >
        <option value="">Select Customer</option>
        {customers.map((c) => (
          <option key={c.cust_id} value={c.cust_id}>
            {c.name}
          </option>
        ))}
      </select>

      <h3 style={{ textAlign: "left" }}>Items</h3>

      {/* Items List */}
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: "10px" }}>
          {item.name} - ₹{item.price}

          <input
            type="number"
            placeholder="Qty"
            style={{ marginLeft: "10px" }}
            onChange={(e) =>
              handleQtyChange(item, Number(e.target.value))
            }
          />
        </div>
      ))}

      <br />

      <button onClick={handleGenerate}>Generate Invoice</button>

      {/* Invoice UI */}
      {invoice && (
        <div
          style={{
            marginTop: "20px",
            border: "2px solid black",
            padding: "15px",
            width: "300px"
          }}
        >
          <h2>Invoice</h2>

          <p><b>Invoice ID:</b> {invoice.invoiceId}</p>
          <p><b>Total:</b> ₹{invoice.total}</p>
          <p><b>GST:</b> ₹{invoice.gstAmount}</p>
          <p><b>Final Amount:</b> ₹{invoice.finalAmount}</p>
        </div>
      )}
    </div>
  );
}

export default App;