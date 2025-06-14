import mongoose from "mongoose";

// For refresh tokens
const blockedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
});

const blockedToken = mongoose.model("BlockedToken", blockedTokenSchema);
export default blockedToken;
