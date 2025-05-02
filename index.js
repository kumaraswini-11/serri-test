const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const fastcsv = require("fast-csv");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const CSV_FILE = "data.csv";

app.use(bodyParser.json());

// Read all users
app.get("/users", (req, res) => {
  const results = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => res.json(results));
});

// Create a user
app.post("/users", (req, res) => {
  const newUser = req.body;
  const users = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => users.push(data))
    .on("end", () => {
      users.push(newUser);
      const ws = fs.createWriteStream(CSV_FILE);
      fastcsv.write(users, { headers: true }).pipe(ws);
      res.status(201).json({ message: "User added", user: newUser });
    });
});

// Update a user by ID
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const updatedUser = req.body;
  const users = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => users.push(data))
    .on("end", () => {
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1)
        return res.status(404).json({ message: "User not found" });

      users[index] = { ...users[index], ...updatedUser };
      const ws = fs.createWriteStream(CSV_FILE);
      fastcsv.write(users, { headers: true }).pipe(ws);
      res.json({ message: "User updated", user: users[index] });
    });
});

// Delete a user by ID
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const users = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => users.push(data))
    .on("end", () => {
      const newUsers = users.filter((u) => u.id !== userId);
      if (newUsers.length === users.length)
        return res.status(404).json({ message: "User not found" });

      const ws = fs.createWriteStream(CSV_FILE);
      fastcsv.write(newUsers, { headers: true }).pipe(ws);
      res.json({ message: "User deleted" });
    });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
