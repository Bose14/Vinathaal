const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateIdToken = require('../utils/idtoken_generator');

module.exports = function(db, transporter, config) {
  const router = express.Router();

  const sendResetEmail = async (email, token) => {
    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: `Vinathaal AI <${config.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Password Reset</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
              <h2>Password Reset Request</h2>
              <p>You requested a password reset. Click the button below to proceed:</p>
              <p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
              </p>
              <p>This link will expire in 1 hour.</p>
              <hr />
              <p style="font-size: 0.9em; color: #555;">If you did not request this, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log('Reset email sent successfully to:', email);
  };

  router.post('/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existing = await db.query('SELECT email FROM users WHERE email = ?', [email]);
      if (existing && existing.length > 0) {
        return res.status(409).json({ message: 'Email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const idtoken = generateIdToken('USER', 10);
      const api_token = generateIdToken('vina_', 16);
      await db.query('INSERT INTO users SET ?', { id_token: idtoken, name, email, password_hash: passwordHash, role: 'user', api_token });

      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ message: 'Server error during signup.' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          api_token: user.api_token,
        },
      });
    } catch (error) {
      console.error('Login Error:', error.stack || error.message || error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  });

  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }

      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000);

      await db.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [resetToken, resetTokenExpires, users[0].id]
      );

      await sendResetEmail(email, resetToken);

      res.status(200).json({ message: 'Password reset link sent successfully.' });
    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json({ message: 'Failed to process request. The email could not be sent.' });
    }
  });

  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Valid token and a password of at least 6 characters are required.' });
      }

      const result = await db.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
      );

      if (!result || result.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
        [hashedPassword, result[0].id]
      );

      res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
      console.error('Reset Password Error:', error);
      res.status(500).json({ message: 'Server error during password reset.' });
    }
  });

  return router;
};
