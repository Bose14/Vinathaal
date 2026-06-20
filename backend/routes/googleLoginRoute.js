const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

module.exports = (config) => {
  const router = express.Router();

  router.post("/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: "Missing Google access token" });
      }

      const googleRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`);
      if (!googleRes.ok) {
        throw new Error(`Google API returned ${googleRes.status}`);
      }

      const userInfo = await googleRes.json();

      const appToken = jwt.sign(
        { id: userInfo.id, name: userInfo.name, email: userInfo.email, picture: userInfo.picture },
        config.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token: appToken,
        user: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        },
      });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  return router;
};
