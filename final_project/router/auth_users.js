const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = []; // Array to store registered users

// Check if the username is valid (does not already exist)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Authenticate user (check if the username and password match)
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// Login as a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    // Generate a JWT token
    const accessToken = jwt.sign(
      { username: user.username }, // Payload
      'secretkey', // Secret key
      { expiresIn: '1h' } // Token expiration
    );

    req.session.authorization = { accessToken, username: user.username };
    return res.status(200).json({ message: "Logged in successfully", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;
  const book = books[isbn];

  if (book) {
    if (book.reviews && book.reviews[username]) {
      book.reviews[username] = review; // Update existing review
    } else {
      book.reviews = { ...book.reviews, [username]: review }; // Add new review
    }
    return res.status(200).json({ message: "Review added/updated successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const username = req.session.authorization.username;
  const book = books[isbn];

  if (book && book.reviews && book.reviews[username]) {
    delete book.reviews[username]; // Delete the review by the current user
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found or not authorized" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
