import app from "./app.js";
import { createHmac } from "crypto";

const PORT = process.env.PORT || 3000;

// const hmacProcess = (value, key) => {
//   const result = createHmac("sha256", key).update(value).digest("hex");
//   return result;
// };
// const code = Math.floor(Math.random() * 1000000).toString();
// console.log("code", code);
// console.log(hmacProcess(code, process.env.JWT_ACCESS_SECRET));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
