const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const SECRET = process.env.JWT_SECRET || "nestfinder_secret_key";

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, SECRET);

        res.json({ token, name: user.name, email: user.email });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SIGN IN
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "No account found with this email!" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: "Incorrect password!" });
        }

        const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, SECRET);
        res.json({ token, name: user.name, email: user.email });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    try {
        console.log("📧 Forgot password triggered");
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

        const { email } = req.body;
        console.log("For email:", email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email!" });
        }

        // Generate reset token
        const token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        console.log("✅ Token saved to user");

        // Create transporter with explicit SMTP settings
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify transporter
        await transporter.verify();
        console.log("✅ Transporter verified");

        const resetUrl = `${process.env.APP_URL || 'https://nestfinder-c6bm.onrender.com'}/reset-password.html?token=${token}`;

        await transporter.sendMail({
            from: `"NestFinder" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your NestFinder password",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #eee;border-radius:12px">
                    <h2 style="color:#1A1714;margin-bottom:8px">🏠 NestFinder</h2>
                    <h3 style="color:#333;margin-bottom:16px">Reset your password</h3>
                    <p style="color:#666;margin-bottom:24px">
                        We received a request to reset your password. Click the button below.
                        This link expires in <strong>15 minutes</strong>.
                    </p>
                    <a href="${resetUrl}"
                        style="display:inline-block;background:#C8472B;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                        Reset Password
                    </a>
                    <p style="color:#999;font-size:12px;margin-top:24px">
                        If you didn't request this, ignore this email. Your password won't change.
                    </p>
                </div>
            `
        });

        console.log("✅ Email sent successfully!");
        res.json({ message: "Reset link sent!" });

    } catch (err) {
        console.log("❌ Email error:", err.message);
        res.status(500).json({ error: "Failed to send email: " + err.message });
    }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: "Reset link expired or invalid!" });
        }

        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        user.resetToken = undefined;
        user.resetTokenExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successfully!" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;