// import express from "express";
// import { ReadData } from "./utils/readData.js";
// import { User } from "./user.js";

// const app = express();

// app.get("/", (req, res) => {
//   res.send("<a href='/about'>About</a>");
// });
// app.get("/about", (req, res) => {
//   res.send("About Page");
// });
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

// app.get("/data", async (req, res) => {
//   try {
//     const data = await ReadData();

//     const users = data.user.map(
//       (item) => new User(item.id, item.name, item.email),
//     );

//     return res.status(200).json(users);
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error reading data",
//     });
//   }
// });

import express from "express";
import { readData } from "./utils/readData.js";
import router from "./src/routes/index.js";

const app = express();

app.use(express.json());
app.use("/api", router);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
