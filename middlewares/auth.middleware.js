import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided!" });

  try {
    let decoded;
    // We need to try decoding with access and refresh both, because this middleware will be used in /refresh route
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    req.username = decoded.sub;
    req.tokenType = decoded.type;
    req.role = decoded.role;
    req.token = token;

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
