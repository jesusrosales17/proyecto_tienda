import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

import config from "../config/config.js";

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../migrations"
);

async function main() {
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No hay archivos .sql en migrations/");
    return;
  }

  const connection = await mysql.createConnection({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    multipleStatements: true,
  });

  try {
    for (const file of files) {
      const sql = (await readFile(path.join(migrationsDir, file), "utf8")).trim();
      if (!sql) continue;
      console.log(`→ ${file}`);
      await connection.query(sql);
    }
    console.log("Listo: migraciones aplicadas.");
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
