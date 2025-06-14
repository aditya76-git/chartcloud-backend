import BlockedToken from "../models/blocked-token.model.js";

export const refreshTokenNotBlockedMiddleware = async (req, res, next) => {
  // Basic auth header checking will be done by authmiddleware first

  try {
    // From auth middlewares
    const { token } = req;

    const blocked = await BlockedToken.findOne({ token });

    if (blocked) {
      return res
        .status(403)
        .json({ success: false, message: "Refresh token is revoked/blocked" });
    }

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Server error" });
  }
};
