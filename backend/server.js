const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./habit_tracker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT,
    color TEXT DEFAULT '#000000',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    user_id INTEGER,
    date TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(habit_id, date)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
}

// Routes

// Check if email exists
app.get('/api/check-email', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ exists: !!row });
  });
});

// Signup
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      // Hash password
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ error: 'Error hashing password' });
        }

        // Insert user
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error creating account' });
          }
          res.status(201).json({ message: 'Account created successfully', userId: this.lastID });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please sign up.' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error verifying password' });
      }
      if (result) {
        res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    });
  });
});

// Middleware to get user_id from headers
const requireAuth = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const parsedId = parseInt(userId);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  req.userId = parsedId;
  next();
};

// Habits API
app.get('/api/habits', requireAuth, (req, res) => {
  db.all('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [req.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/habits', requireAuth, (req, res) => {
  const { name, description, frequency, color } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Habit name is required' });
  }

  // First verify the user exists
  db.get('SELECT id FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.run('INSERT INTO habits (user_id, name, description, frequency, color) VALUES (?, ?, ?, ?, ?)',
      [req.userId, name, description || '', frequency || 'daily', color || '#000000'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating habit' });
        }
        res.status(201).json({ id: this.lastID, message: 'Habit created successfully' });
      });
  });
});

app.put('/api/habits/:id', requireAuth, (req, res) => {
  const { name, description, frequency, color } = req.body;
  const habitId = req.params.id;

  db.run('UPDATE habits SET name = ?, description = ?, frequency = ?, color = ? WHERE id = ? AND user_id = ?',
    [name, description, frequency, color, habitId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating habit' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      res.json({ message: 'Habit updated successfully' });
    });
});

app.delete('/api/habits/:id', requireAuth, (req, res) => {
  const habitId = req.params.id;

  db.run('DELETE FROM habits WHERE id = ? AND user_id = ?', [habitId, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting habit' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  });
});

// Completions API
app.get('/api/completions', requireAuth, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM completions WHERE user_id = ?';
  let params = [req.userId];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/completions', requireAuth, (req, res) => {
  const { habitId, date, completed } = req.body;

  if (!habitId || !date) {
    return res.status(400).json({ error: 'Habit ID and date are required' });
  }

  // First verify the habit belongs to the user
  db.get('SELECT id FROM habits WHERE id = ? AND user_id = ?', [habitId, req.userId], (err, habit) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    db.run('INSERT OR REPLACE INTO completions (habit_id, user_id, date, completed) VALUES (?, ?, ?, ?)',
      [habitId, req.userId, date, completed ? 1 : 0],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error updating completion' });
        }
        res.json({ message: 'Completion updated successfully' });
      });
  });
});

// Notifications API
app.get('/api/notifications', requireAuth, (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/notifications', requireAuth, (req, res) => {
  const { message, type } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  db.run('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
    [req.userId, message, type || 'info'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating notification' });
      }
      res.json({ id: this.lastID, message: 'Notification created successfully' });
    });
});

app.put('/api/notifications/:id/read', requireAuth, (req, res) => {
  const notificationId = req.params.id;

  db.run('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating notification' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ message: 'Notification marked as read' });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});