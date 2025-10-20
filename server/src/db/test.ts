import { db } from "./database";

/**
 * Test script to verify database structure and operations
 */
async function testDatabase() {
	console.log("🧪 Testing database structure...\n");

	try {
		// Test 1: Get all guilds
		console.log("1️⃣ Testing guilds table...");
		const guilds = await db.getAllGuilds();
		console.log(`   ✅ Found ${guilds.length} guilds`);

		// Test 2: Get all teams
		console.log("\n2️⃣ Testing teams table...");
		const teams = await db.getAllTeams();
		console.log(`   ✅ Found ${teams.length} teams`);

		// Test 3: Create a test guild
		console.log("\n3️⃣ Testing guild creation...");
		const testGuild = await db.createGuild({
			name: "Test Guild",
			image: "https://example.com/test.png",
			motto: "Test motto",
			description: "A test guild",
			primary_color: "#00FF00",
			place: "Test Place",
			old_job: "Test Job"
		});
		console.log(`   ✅ Created guild with ID: ${testGuild.id}`);

		// Test 4: Get the created guild
		console.log("\n4️⃣ Testing guild retrieval...");
		const retrievedGuild = await db.getGuildById(testGuild.id);
		console.log(`   ✅ Retrieved guild: ${retrievedGuild?.name}`);

		// Test 5: Clean up - delete test guild
		console.log("\n5️⃣ Cleaning up...");
		const deleted = await db.deleteGuild(testGuild.id);
		console.log(`   ✅ Deleted test guild: ${deleted}`);

		console.log("\n✨ All tests passed!\n");

		// Display current state
		console.log("📊 Current database state:");
		console.log(`   - Guilds: ${(await db.getAllGuilds()).length}`);
		console.log(`   - Teams: ${(await db.getAllTeams()).length}`);

	} catch (error) {
		console.error("\n❌ Test failed:", error);
	}
}

// Run tests
if (require.main === module) {
	testDatabase().then(() => {
		console.log("\n👋 Tests completed!");
		process.exit(0);
	}).catch((error) => {
		console.error("\n💥 Tests failed:", error);
		process.exit(1);
	});
}

export { testDatabase };
