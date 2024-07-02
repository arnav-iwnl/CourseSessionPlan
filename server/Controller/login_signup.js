const { z } = require("zod");
const db = require('../db')



const signUpController = (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Insert new user
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Server error' });
                }
                res.status(201).json({ message: 'User created successfully', name: name });
            }
        );
    });
}

const loginController = (req, res) => {
    const { email, password } = req.body;

    // Find user and check password
    db.query('SELECT id,name FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email-ID or password' });
        }

        const user = results[0];
        // console.log(user)
        res.json({
            message: 'Signed in successfully',
            userId: user.id,
            name: user.name
        });
    });
}

module.exports = {
    loginController,
    signUpController
}