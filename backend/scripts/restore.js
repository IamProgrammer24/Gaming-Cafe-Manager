import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import mongoose from "mongoose";

// To test safely, set RESTORE_MONGO_URI to a DIFFERENT, empty database.
if (process.env.RESTORE_MONGO_URI)
  process.env.MONGO_URI = process.env.RESTORE_MONGO_URI;
const { connectDB } = await import("../src/config/db.js");

const { EJSON } = mongoose.mongo.BSON;
const CHUNK = 1000;

async function run() {
  const folder = process.argv[2];
  if (!folder || !fs.existsSync(path.join(folder, "manifest.json"))) {
    throw new Error(
      "Usage: npm run restore -- backups/<folder>   (folder must contain manifest.json)",
    );
  }

  const manifest = JSON.parse(
    fs.readFileSync(path.join(folder, "manifest.json"), "utf8"),
  );
  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".json.gz"));

  await connectDB();
  const db = mongoose.connection.db;
  console.log(
    `Restoring backup from ${manifest.createdAt} into database "${db.databaseName}"`,
  );

  // Safety: never write into a database that already has data.
  const notEmpty = [];
  for (const f of files) {
    const name = f.replace(".json.gz", "");
    if ((await db.collection(name).countDocuments()) > 0) notEmpty.push(name);
  }
  if (notEmpty.length) {
    throw new Error(
      `Refusing to restore: these collections already contain data: ${notEmpty.join(", ")}`,
    );
  }

  for (const f of files) {
    const name = f.replace(".json.gz", "");
    const docs = EJSON.parse(
      zlib.gunzipSync(fs.readFileSync(path.join(folder, f))).toString("utf8"),
    );

    for (let i = 0; i < docs.length; i += CHUNK) {
      await db.collection(name).insertMany(docs.slice(i, i + CHUNK));
    }

    const now = await db.collection(name).countDocuments();
    const expected = manifest.collections[name];
    console.log(
      `  ${name}: ${now} documents ${now === expected ? "(OK)" : `(EXPECTED ${expected}!)`}`,
    );
  }

  console.log("Done. Start the server once so indexes are rebuilt.");
}

run()
  .catch((err) => {
    console.error("Restore failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
