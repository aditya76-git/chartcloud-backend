import jwt from "jsonwebtoken";

// Check if the token belogs to admin or not
// Middleware to protect admin routes
export const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const role = decoded.role;

    if (role != "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.log(err);

    let message = "Invalid token";

    if (String(err).includes("expired")) {
      message = "Token expired";
    }

    res.status(401).json({ success: false, message });
  }
};
