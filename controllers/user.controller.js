import User from "../models/user.model.js";

export const info = async (req, res) => {
  const { username, tokenType } = req;

  if (tokenType == "refresh") {
    return res
      .status(400)
      .json({ success: false, message: "Access token required" });
  }

  const user = await User.findOne({ username });

  return res.status(200).json({
    success: true,
    message: "User info fetched successfully",
    info: user,
  });
};
