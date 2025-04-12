const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt'); // Import bcrypt
const multer = require('multer'); // Import multer
const fs = require('fs'); // Import fs
const cors = require('cors'); // Import cors

const app = express();
const db = new sqlite3.Database('users.db');

// Configure middleware properly
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = req.body.path || "upload/default";

        // Remove any path traversal attempts
        uploadPath = path.normalize(uploadPath).replace(/^(\.\.(\/|\\|$))+/, '');
        
        let finalPath = path.join(__dirname, uploadPath);
        console.log("Saving files to:", finalPath);

        fs.mkdirSync(finalPath, { recursive: true });
        cb(null, finalPath);
    },
    filename: function (req, file, cb) {
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9-_.\s]/g, '');
        cb(null, sanitizedFileName);
    }
});

const upload = multer({ storage });

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    branch TEXT,
    usertype TEXT
)`, function(err) {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        // Insert default admin user if no users exist
        db.get('SELECT COUNT(*) as count FROM users', [], function(err, row) {
            if (err) {
                console.error('Error checking users:', err.message);
                return;
            }
            
            if (row.count === 0) {
                bcrypt.hash('admin123', 10, (err, hashedPassword) => { // Hash default admin password
                    if (err) {
                        console.error('Error hashing admin password:', err.message);
                        return;
                    }
                    db.run('INSERT INTO users (username, password, branch, usertype) VALUES (?, ?, ?, ?)',
                        ['admin', hashedPassword, 'Delhi', 'Admin'], function(err) {
                            if (err) {
                                console.error('Error creating admin user:', err.message);
                            } else {
                                console.log('Default admin user created (username: admin, password: admin123)');
                            }
                        });
                });
            }
        });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    console.log('Login request received:', req.body); // Debug
    const { username, password, branch } = req.body;
    
    if (!username || !password || !branch) {
        console.log('Missing fields in request'); // Debug
        return res.json({ success: false, error: 'All fields are required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ? AND branch = ?',
        [username, branch], (err, row) => {
            if (err) {
                console.error('Login error:', err.message);
                return res.json({ success: false, error: 'Database error' });
            }
            
            if (row) {
                console.log('User found:', row); // Debug
                // Compare hashed password
                bcrypt.compare(password, row.password, (err, result) => {
                    if (result) {
                        res.json({ success: true, usertype: row.usertype, username: row.username });
                    } else {
                        console.log('Invalid credentials'); // Debug
                        res.json({ success: false, error: 'Invalid credentials' });
                    }
                });
            } else {
                console.log('Invalid credentials'); // Debug
                res.json({ success: false, error: 'Invalid credentials' });
            }
        });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, password, branch, usertype } = req.body;

    if (!username || !password || !branch || !usertype) {
        return res.json({ success: false, error: 'All fields are required' });
    }

    // Hash the password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err.message);
            return res.json({ success: false, error: 'Error processing password' });
        }

        db.run('INSERT INTO users (username, password, branch, usertype) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, branch, usertype], (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        res.json({ success: false, error: 'Username already exists' });
                    } else {
                        res.json({ success: false, error: 'Database error' });
                    }
                } else {
                    res.json({ success: true });
                }
            });
    });
});

// Get all users (admin only)
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.json({ success: false });
        } else {
            res.json({ success: true, users: rows });
        }
    });
});

// Delete user endpoint
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) {
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

// Edit user endpoint
app.put('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const { username, password, branch, usertype } = req.body;

    if (!username || !branch || !usertype) {
        return res.json({ success: false, error: 'Missing required fields' });
    }

    let query, params;
    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err.message);
                return res.json({ success: false, error: 'Error processing password' });
            }
            query = 'UPDATE users SET username = ?, password = ?, branch = ?, usertype = ? WHERE id = ?';
            params = [username, hashedPassword, branch, usertype, id];

            db.run(query, params, function(err) {
                if (err) {
                    console.error('Database error:', err);
                    res.json({ success: false, error: err.message });
                } else if (this.changes === 0) {
                    res.json({ success: false, error: 'User not found' });
                } else {
                    res.json({ success: true });
                }
            });
        });
    } else {
        query = 'UPDATE users SET username = ?, branch = ?, usertype = ? WHERE id = ?';
        params = [username, branch, usertype, id];

        db.run(query, params, function(err) {
            if (err) {
                console.error('Database error:', err);
                res.json({ success: false, error: err.message });
            } else if (this.changes === 0) {
                res.json({ success: false, error: 'User not found' });
            } else {
                res.json({ success: true });
            }
        });
    }
});

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
    try {
        console.log('Received files:', req.files);
        console.log('Upload path:', req.body.path);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded.' });
        }
        res.json({ success: true, message: 'Files uploaded successfully!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error uploading files: ' + error.message });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});
