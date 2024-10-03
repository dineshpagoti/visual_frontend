const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./books.db');

// Initialize the database (run this once to create the table)
db.run(`CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  genre TEXT,
  year INTEGER,
  rating REAL,
  description TEXT
)`);

// Routes

// GET all books from database
app.get('/books', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET a single book by ID
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { message: 'Book not found' });
  });
});

// POST a new book to the database
app.post('/books', (req, res) => {
  const { title, author, genre, year, rating, description } = req.body;
  db.run(
    `INSERT INTO books (title, author, genre, year, rating, description) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, author, genre, year, rating, description],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// DELETE a book from the database
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;
  db.run('DELETE FROM books WHERE id = ?', [bookId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Book deleted successfully' });
  });
});

// Server listening
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
