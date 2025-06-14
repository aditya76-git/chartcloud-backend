import jwt from "jsonwebtoken";

export const generateAccessToken = (username, role) => {
  const payload = {
    sub: username,
    role,
    type: "access",
    issuer: "chartcloud",
  };
  const options = {
    expiresIn: "10m",
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (username, role) => {
  const payload = {
    sub: username,
    role,
    type: "refresh",
    issuer: "chartcloud",
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET);
};
