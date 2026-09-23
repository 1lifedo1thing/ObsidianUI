import { initVisitorTable } from "../src/lib/server/visitors";

initVisitorTable()
  .then(() => console.log("Visitor database schema is ready."))
  .catch(() => {
    console.error("Unable to initialize the visitor schema. Check DATABASE_URL and database permissions.");
    process.exitCode = 1;
  });
