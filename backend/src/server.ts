import app from "./app";
import { bootstrapSuperAdmin } from "./config/bootstrap";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await bootstrapSuperAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
