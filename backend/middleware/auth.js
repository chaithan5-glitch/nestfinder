const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "nestfinder_secret_key";

module.exports = function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Not authorized" });
    }
    try {
        const token = header.split(" ")[1];
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};