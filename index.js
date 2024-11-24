const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Added to handle form data

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Mock users
const users = [
    { id: 1, username: 'admin', password: 'password', role: 'admin' },
    { id: 2, username: 'user', password: 'password', role: 'user' },
];

// Routes

// Home route
app.get('/', (req, res) => {
    res.send(`
    <h1>Authentication and Authorization Demo</h1>
    <form action="/login" method="POST">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required><br><br>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required><br><br>
      <button type="submit">Login</button>
    </form>
    <p>Use <code>/dashboard</code> and <code>/admin</code> after login with the token.</p>
  `);
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate user
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).send('<h1>Invalid credentials</h1>');
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
        expiresIn: '1h',
    });

    res.send(`
    <h1>Login Successful</h1>
    <p>Your token:</p>
    <textarea readonly style="width: 100%; height: 100px;">${token}</textarea>
    <p>Use the links below to access protected routes:</p>
    <a href="/dashboard?token=${token}">Go to Dashboard</a><br>
    <a href="/admin?token=${token}">Go to Admin Page</a>
  `);
});

// Protected route
app.get('/dashboard', (req, res) => {
    const token = req.query.token;

    if (!token) return res.status(403).send('<h1>Access Denied</h1>');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('<h1>Invalid Token</h1>');

        res.send(`
      <h1>Welcome ${user.role}, to the Dashboard</h1>
      <p>This is a protected route.</p>
    `);
    });
});

// Admin-only route
app.get('/admin', (req, res) => {
    const token = req.query.token;

    if (!token) return res.status(403).send('<h1>Access Denied</h1>');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('<h1>Invalid Token</h1>');

        if (user.role !== 'admin') {
            return res.status(403).send('<h1>Forbidden: Insufficient permissions</h1>');
        }

        res.send('<h1>Welcome Admin, you have full access.</h1>');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
