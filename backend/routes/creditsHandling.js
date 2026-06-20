const express = require("express");

module.exports = function CreditsHandling(db) {
    const router = express.Router();

    router.post("/get-credits", async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        try {
            const rows = await db.query("SELECT credits FROM users WHERE email = ?", [email]);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.json({ email, credits: rows[0].credits });
        } catch (error) {
            console.error("❌ Error fetching credits:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
    });

    router.post("/deduct-credits", async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const rows = await db.query("SELECT credits FROM users WHERE email = ?", [email]);

            if (!rows || rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const currentCredits = Number(rows[0].credits);
            if (currentCredits < 1) {
                return res.status(400).json({ message: "Not enough credits" });
            }

            const newCredits = currentCredits - 1;
            await db.query("UPDATE users SET credits = ? WHERE email = ?", [newCredits, email]);

            return res.json({ email, credits: newCredits });
        } catch (error) {
            console.error("❌ Error deducting credits:", error);
            return res.status(500).json({ message: "Database error", error: error.message });
        }
    });

    console.log("✅ Credits Handling successfully working");

    return router;
};
