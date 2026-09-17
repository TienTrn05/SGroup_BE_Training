import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDB } from "./config/db.config.js";
import { checkTokenConfig } from "./utils/token.js";

const startServer = async () => {
  checkTokenConfig();
  // Check and initialize DB connection
  await connectDB();

  app.listen(config.app.port, () => {
    console.log(
      `Server is running on port http://localhost:${config.app.port}`,
    );
  });
};

startServer();
