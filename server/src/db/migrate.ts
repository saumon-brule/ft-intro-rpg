import sqlite3 from "sqlite3";
import path from "path";

/**
 * Migration script to add permission column to existing users
 * This script should be run once to update the database schema
 */

const sqlite = sqlite3.verbose();
const dbPath = path.join(__dirname, "../../database.db");

console.log("🔄 Starting migration...");
console.log(`📂 Database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error("❌ Error opening database:", err);
		process.exit(1);
	}
});

// Check if permission column already exists
db.all("PRAGMA table_info(users)", (err, columns: any[]) => {
	if (err) {
		console.error("❌ Error checking table schema:", err);
		db.close();
		process.exit(1);
	}

	const hasPermissionColumn = columns.some(col => col.name === "permission");

	if (hasPermissionColumn) {
		console.log("✅ Permission column already exists. Migration not needed.");
		db.close();
		process.exit(0);
	}

	console.log("📝 Adding permission column to users table...");

	// Add permission column with default value 0 (USER)
	db.run("ALTER TABLE users ADD COLUMN permission INTEGER DEFAULT 0", (err) => {
		if (err) {
			console.error("❌ Error adding permission column:", err);
			db.close();
			process.exit(1);
		}

		console.log("✅ Permission column added successfully!");

		// Verify the change
		db.all("SELECT COUNT(*) as count FROM users", (err, result: any[]) => {
			if (err) {
				console.error("❌ Error verifying migration:", err);
			} else {
				console.log(`📊 Updated ${result[0].count} user(s)`);
			}

			db.close(() => {
				console.log("\n✨ Migration completed successfully!");
				process.exit(0);
			});
		});
	});
});
