import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";

const { EJSON } = mongoose.mongo.BSON; // keeps ObjectIds and Dates exact
const root = path.resolve(process.env.BACKUP_DIR || "backups");
const keep = Number(process.env.BACKUP_KEEP) || 14;
const FOLDER = /^\d{4}-\d{2}-\d{2}_\d{4}$/;

const stamp = () =>
  new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", ""); // UTC

function pruneOld() {
  const folders = fs
    .readdirSync(root)
    .filter((f) => FOLDER.test(f))
    .sort();
  for (const f of folders.slice(0, Math.max(folders.length - keep, 0))) {
    fs.rmSync(path.join(root, f), { recursive: true, force: true });
    console.log(`Removed old backup: ${f}`);
  }
}

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const finalDir = path.join(root, stamp());
  const tmpDir = `${finalDir}.partial`; // renamed only when complete
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    const names = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map((c) => c.name)
      .filter((n) => !n.startsWith("system."));

    const manifest = {
      createdAt: new Date().toISOString(),
      database: db.databaseName,
      collections: {},
    };

    for (const name of names) {
      const docs = await db.collection(name).find({}).toArray();
      const json = EJSON.stringify(docs, { relaxed: false });
      fs.writeFileSync(
        path.join(tmpDir, `${name}.json.gz`),
        zlib.gzipSync(json),
      );
      manifest.collections[name] = docs.length;
      console.log(`  ${name}: ${docs.length} documents`);
    }

    fs.writeFileSync(
      path.join(tmpDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
    fs.renameSync(tmpDir, finalDir);
    console.log(`Backup complete: ${finalDir}`);
    pruneOld();
  } catch (err) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw err;
  }
}

run()
  .catch((err) => {
    console.error("Backup failed:", err.message);
    process.exitCode = 1; // schedulers can detect failure
  })
  .finally(() => mongoose.disconnect());
