import app from "./app.js";
import config from "./config/config.js";
import pool from "./config/database.js";

const server = app.listen(config.port, () => {
  console.log(`Servidor corriendo en el puerto ${config.port}`)
  console.log(`http://localhost:${config.port}`)
})

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Recibida senal ${signal}. Cerrando servidor...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log("Pool de MySQL cerrado correctamente");
      process.exit(0);
    } catch (error) {
      console.error("Error al cerrar el pool de MySQL", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});