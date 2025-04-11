import "reflect-metadata";
import { Sequelize } from "sequelize-typescript";
import { Umzug, SequelizeStorage } from "umzug";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Setup Sequelize
const sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
});

// Setup Umzug
const umzug = new Umzug({
  migrations: {
    glob: path.posix.join("src", "migrations", "*.ts"),
    resolve: ({ name, path, context }) => {
      // Import migration module dynamically
      const migration = require(path!);
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Run this function to show migration status
const showMigrationStatus = async () => {
  const executed = await umzug.executed();
  const pending = await umzug.pending();

  console.log("\n✅ Executed Migrations:");
  executed.forEach((m: { name: string }) => console.log(" -", m.name));

  console.log("\n⏳ Pending Migrations:");
  pending.forEach((m: { name: string }) => console.log(" -", m.name));
};

// Determine which command to run
const command = process.argv[2] || "up";

if (command === "status") {
  showMigrationStatus().catch((err) => {
    console.error("❌ Failed to get migration status:", err);
    process.exit(1);
  });
} else if (command === "down") {
  // Run down migration for the most recent migration
  umzug
    .down()
    .then(() => console.log("✅ Down migration executed successfully"))
    .catch((err) => {
      console.error("❌ Down migration failed", err);
      process.exit(1);
    });
} else {
  // Run up migrations by default
  umzug
    .up()
    .then(() => console.log("✅ Up migrations executed successfully"))
    .catch((err) => {
      console.error("❌ Migration failed", err);
      process.exit(1);
    });
}
