import { main } from "./index";

// Entry point for Bun
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
