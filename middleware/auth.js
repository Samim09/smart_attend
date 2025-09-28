const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "mysecretkey", (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }
    req.user = user; // decoded payload (id, email, etc.)
    next();
  });
}

module.exports = authMiddleware;