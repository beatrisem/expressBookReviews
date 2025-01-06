const express = require('express');
const axios = require('axios'); // Import Axios for making HTTP requests
let books = require("./booksdb.js"); // Assuming books is an object with book details
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    // Check if username or password is missing
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the user already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists!" });
  }

  // Add the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop using async/await and Axios
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://beatrisemazj-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books');
    const books = response.data; // Assuming the API returns the list of books

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error });
  }
});

// Get book details based on ISBN using async/await and Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;

  try {
    const response = await axios.get(`https://beatrisemazj-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/${isbn}`); 
    const book = response.data;

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details", error });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;
  
    try {
      const response = await axios.get(`https://beatrisemazj-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books?author=${author}`); 
      const booksByAuthor = response.data;
  
      if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
      } else {
        return res.status(404).json({ message: "No books found by this author." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by author", error });
    }
  });

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
  
    try {
      const response = await axios.get(`https://beatrisemazj-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books?title=${title}`); 
      const booksByTitle = response.data;
  
      if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
      } else {
        return res.status(404).json({ message: "No books found with this title." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by title", error });
    }
  });

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;

  // Get the reviews for the book by ISBN
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book." });
  }
});

module.exports.general = public_users;
