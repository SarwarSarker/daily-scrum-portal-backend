import app from "./app";
import { env } from "./configs/env";

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});