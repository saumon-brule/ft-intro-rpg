import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

// Database types
export enum UserPermission {
	USER = 0,
	PNJ = 1,
	ADMIN = 2
}

export interface User {
	id: number;
	id42: number;
	login: string;
	image: string;
	pool_month: string;
	pool_year: string;
	permission: UserPermission;
}

export interface UserInsert {
	id42: number;
	login: string;
	image: string;
	pool_month: string;
	pool_year: string;
	permission?: UserPermission;
}

export interface Guild {
	id: number;
	name: string;
	image: string;
	motto: string;
	description: string;
	primary_color: string;
	place: string;
	old_job: string;
	created_at?: string;
	updated_at?: string;
}

export interface GuildInsert {
	name: string;
	image: string;
	motto: string;
	description: string;
	primary_color: string;
	place: string;
	old_job: string;
}


export interface Team {
	id: number;
	guild_id: number;
	xp: number;
	created_at?: string;
	updated_at?: string;
}


export interface TeamInsert {
	guild_id: number;
	xp?: number;
}

export interface TeamMember {
	team_id: number;
	user_id: number;
	joined_at?: string;
}

export interface Quest {
	id: number;
	name: string;
	place: string;
	clue: string;
	lore: string;
	time_limit: number;
	xp: number;
	pnj_id?: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface QuestInsert {
	name: string;
	place: string;
	clue: string;
	lore: string;
	time_limit: number;
	xp: number;
	pnj_id?: number | null;
}

export interface ActiveQuest {
	id: number;
	quest_id: number;
	team_id: number;
	ends_at: string; // ISO datetime string
	status: "in_progress" | "finished";
	validated: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface ActiveQuestInsert {
	quest_id: number;
	team_id: number;
	ends_at: string; // precise end datetime
	status?: "in_progress" | "finished";
	validated?: boolean;
}

class Database {
	private db: sqlite3.Database;

	constructor() {
		const dbPath = path.join(__dirname, "../../database.db");
		this.db = new sqlite3.Database(dbPath, (err) => {
			if (err) {
				console.error("Error opening database:", err);
			} else {
				console.log("Database connected successfully");
				// Ensure foreign key constraints are enforced
				this.db.run("PRAGMA foreign_keys = ON", (prErr) => {
					if (prErr) console.error("Failed to enable foreign keys:", prErr);
					this.initializeDatabase();
				});
			}
		});
	}

	private initializeDatabase() {
		// Create users table
		const createUsersTable = `
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				id42 INTEGER UNIQUE NOT NULL,
				login TEXT NOT NULL,
				image TEXT NOT NULL,
				pool_month TEXT NOT NULL,
				pool_year TEXT NOT NULL,
				permission INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`;

		// Create guilds table
		const createGuildsTable = `
			CREATE TABLE IF NOT EXISTS guilds (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL,
				image TEXT NOT NULL,
				motto TEXT NOT NULL,
				description TEXT NOT NULL,
				primary_color TEXT NOT NULL,
				place TEXT NOT NULL,
				old_job TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`;

		// Create teams table
		const createTeamsTable = `
			CREATE TABLE IF NOT EXISTS teams (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				guild_id INTEGER NOT NULL,
				xp INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
			)
		`;

		// Create team_members table (no role column)
		const createTeamMembersTable = `
			CREATE TABLE IF NOT EXISTS team_members (
				team_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (team_id, user_id),
				FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			)
		`;


		this.db.serialize(() => {
			this.db.run(createUsersTable, (err) => {
				if (err) {
					console.error("Error creating users table:", err);
				} else {
					console.log("Users table is ready");
				}
			});

			this.db.run(createGuildsTable, (err) => {
				if (err) {
					console.error("Error creating guilds table:", err);
				} else {
					console.log("Guilds table is ready");
				}
			});

			this.db.run(createTeamsTable, (err) => {
				if (err) {
					console.error("Error creating teams table:", err);
				} else {
					console.log("Teams table is ready");
				}
			});

			this.db.run(createTeamMembersTable, (err) => {
				if (err) {
					console.error("Error creating team_members table:", err);
				} else {
					console.log("Team members table is ready");
				}
			});

			// Create quests table
			const createQuestsTable = `
				CREATE TABLE IF NOT EXISTS quests (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					name TEXT NOT NULL,
					place TEXT NOT NULL,
					clue TEXT NOT NULL,
					lore TEXT NOT NULL,
					time_limit INTEGER NOT NULL,
					xp INTEGER NOT NULL,
					pnj_id INTEGER,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (pnj_id) REFERENCES users(id) ON DELETE SET NULL
				)
			`;

			this.db.run(createQuestsTable, (err) => {
				if (err) {
					console.error("Error creating quests table:", err);
				} else {
					console.log("Quests table is ready");
				}
			});

			// Create active_quests table to track quests in progress
			const createActiveQuestsTable = `
				CREATE TABLE IF NOT EXISTS active_quests (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					quest_id INTEGER NOT NULL,
					team_id INTEGER NOT NULL,
					ends_at DATETIME NOT NULL,
					status TEXT NOT NULL DEFAULT 'in_progress',
					validated INTEGER DEFAULT 0,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
					FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
					CHECK(status IN ('in_progress','finished'))
				)
			`;

			this.db.run(createActiveQuestsTable, (err) => {
				if (err) {
					console.error("Error creating active_quests table:", err);
				} else {
					console.log("Active quests table is ready");
				}
			});


		});
	}

	async getAllUsers(): Promise<User[]> {
		const query = "SELECT * FROM users";
		return new Promise((resolve, reject) => {
			this.db.all(query, [], (err, rows: User[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			});
		});
	}

	async findUserById(id: number): Promise<User | null> {
		const query = "SELECT * FROM users WHERE id = ?";
		
		return new Promise((resolve, reject) => {
			this.db.get(query, [id], (err, row: User | undefined) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async findUserById42(id42: number): Promise<User | null> {
		const query = "SELECT * FROM users WHERE id42 = ?";
		
		return new Promise((resolve, reject) => {
			this.db.get(query, [id42], (err, row: User | undefined) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async createUser(userData: UserInsert): Promise<User> {
		const permission = userData.permission ?? UserPermission.USER;
		const query = `
			INSERT INTO users (id42, login, image, pool_month, pool_year, permission)
			VALUES (?, ?, ?, ?, ?, ?)
		`;

		return new Promise((resolve, reject) => {
			this.db.run(
				query,
				[userData.id42, userData.login, userData.image, userData.pool_month, userData.pool_year, permission],
				function(err) {
					if (err) {
						reject(err);
					} else {
						// Fetch the newly created user
						db.findUserById42(userData.id42)
							.then(user => {
								if (user) {
									resolve(user);
								} else {
									reject(new Error("Failed to retrieve created user"));
								}
							})
							.catch(reject);
					}
				}
			);
		});
	}

	async updateUser(id42: number, userData: Partial<UserInsert> & { permission?: UserPermission }): Promise<User | null> {
		const updates: string[] = [];
		const values: any[] = [];

		if (userData.login !== undefined) {
			updates.push("login = ?");
			values.push(userData.login);
		}
		if (userData.image !== undefined) {
			updates.push("image = ?");
			values.push(userData.image);
		}
		if (userData.pool_month !== undefined) {
			updates.push("pool_month = ?");
			values.push(userData.pool_month);
		}
		if (userData.pool_year !== undefined) {
			updates.push("pool_year = ?");
			values.push(userData.pool_year);
		}
		if (userData.permission !== undefined) {
			updates.push("permission = ?");
			values.push(userData.permission);
		}

		if (updates.length === 0) {
			return this.findUserById42(id42);
		}

		updates.push("updated_at = CURRENT_TIMESTAMP");
		values.push(id42);

		const query = `UPDATE users SET ${updates.join(", ")} WHERE id42 = ?`;

		return new Promise((resolve, reject) => {
			this.db.run(query, values, (err) => {
				if (err) {
					reject(err);
				} else {
					this.findUserById42(id42)
						.then(resolve)
						.catch(reject);
				}
			});
		});
	}

	async findOrCreateUser(userData: UserInsert): Promise<User> {
		const existingUser = await this.findUserById42(userData.id42);
		
		if (existingUser) {
			console.log(`User ${userData.login} already exists, logging in...`);
			return existingUser;
		}

		console.log(`Creating new user ${userData.login}...`);
		return this.createUser(userData);
	}

	// ===== GUILD METHODS =====

	async getAllGuilds(): Promise<Guild[]> {
		const query = "SELECT * FROM guilds";
		
		return new Promise((resolve, reject) => {
			this.db.all(query, [], (err, rows: Guild[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			});
		});
	}

	async getGuildById(id: number): Promise<Guild | null> {
		const query = "SELECT * FROM guilds WHERE id = ?";
		
		return new Promise((resolve, reject) => {
			this.db.get(query, [id], (err, row: Guild | undefined) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async createGuild(guildData: GuildInsert): Promise<Guild> {
		const query = `
			INSERT INTO guilds (name, image, motto, description, primary_color, place, old_job)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`;

		return new Promise((resolve, reject) => {
			this.db.run(
				query,
				[guildData.name, guildData.image, guildData.motto, guildData.description, guildData.primary_color, guildData.place, guildData.old_job],
				function(err) {
					if (err) {
						reject(err);
					} else {
						db.getGuildById(this.lastID)
							.then(guild => {
								if (guild) {
									resolve(guild);
								} else {
									reject(new Error("Failed to retrieve created guild"));
								}
							})
							.catch(reject);
					}
				}
			);
		});
	}

	async updateGuild(id: number, guildData: Partial<GuildInsert>): Promise<Guild | null> {
		const updates: string[] = [];
		const values: any[] = [];

		if (guildData.name !== undefined) {
			updates.push("name = ?");
			values.push(guildData.name);
		}
		if (guildData.image !== undefined) {
			updates.push("image = ?");
			values.push(guildData.image);
		}
		if (guildData.motto !== undefined) {
			updates.push("motto = ?");
			values.push(guildData.motto);
		}
		if (guildData.description !== undefined) {
			updates.push("description = ?");
			values.push(guildData.description);
		}
		if (guildData.primary_color !== undefined) {
			updates.push("primary_color = ?");
			values.push(guildData.primary_color);
		}
		if (guildData.place !== undefined) {
			updates.push("place = ?");
			values.push(guildData.place);
		}
		if (guildData.old_job !== undefined) {
			updates.push("old_job = ?");
			values.push(guildData.old_job);
		}

		if (updates.length === 0) {
			return this.getGuildById(id);
		}

		updates.push("updated_at = CURRENT_TIMESTAMP");
		values.push(id);

		const query = `UPDATE guilds SET ${updates.join(", ")} WHERE id = ?`;

		return new Promise((resolve, reject) => {
			this.db.run(query, values, (err) => {
				if (err) {
					reject(err);
				} else {
					this.getGuildById(id)
						.then(resolve)
						.catch(reject);
				}
			});
		});
	}

	async deleteGuild(id: number): Promise<boolean> {
		const query = "DELETE FROM guilds WHERE id = ?";

		return new Promise((resolve, reject) => {
			this.db.run(query, [id], function(err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.changes > 0);
				}
			});
		});
	}

	// ===== TEAM METHODS =====

	async getAllTeams(): Promise<Team[]> {
		const query = "SELECT * FROM teams";
		
		return new Promise((resolve, reject) => {
			this.db.all(query, [], (err, rows: Team[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			});
		});
	}

	async getTeamById(id: number): Promise<Team | null> {
		const query = "SELECT * FROM teams WHERE id = ?";
		
		return new Promise((resolve, reject) => {
			this.db.get(query, [id], (err, row: Team | undefined) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async getTeamsByGuild(guildId: number): Promise<Team[]> {
		const query = "SELECT * FROM teams WHERE guild_id = ?";
		
		return new Promise((resolve, reject) => {
			this.db.all(query, [guildId], (err, rows: Team[]) => {
				if (err) {
					reject(err);
				} else {
					resolve(rows || []);
				}
			});
		});
	}



	async createTeam(teamData: TeamInsert): Promise<Team> {
		const query = `INSERT INTO teams (guild_id, xp) VALUES (?, ?)`;

		const xp = teamData.xp ?? 0;

		return new Promise((resolve, reject) => {
			this.db.run(query, [teamData.guild_id, xp], function(err) {
				if (err) return reject(err);
				db.getTeamById(this.lastID).then(team => team ? resolve(team) : reject(new Error("Failed to retrieve created team"))).catch(reject);
			});
		});
	}

	async updateTeam(id: number, teamData: Partial<TeamInsert> & { xp?: number }): Promise<Team | null> {
		const updates: string[] = [];
		const values: any[] = [];
		if (teamData.guild_id !== undefined) {
			updates.push("guild_id = ?");
			values.push(teamData.guild_id);
		}
		if (teamData.xp !== undefined) {
			updates.push("xp = ?");
			values.push(teamData.xp);
		}

		if (updates.length === 0) {
			return this.getTeamById(id);
		}

		updates.push("updated_at = CURRENT_TIMESTAMP");
		values.push(id);

		const query = `UPDATE teams SET ${updates.join(", ")} WHERE id = ?`;

		return new Promise((resolve, reject) => {
			this.db.run(query, values, (err) => {
				if (err) {
					reject(err);
				} else {
					this.getTeamById(id)
						.then(resolve)
						.catch(reject);
				}
			});
		});
	}

	async addTeamXp(teamId: number, xpToAdd: number): Promise<Team | null> {
		const query = "UPDATE teams SET xp = xp + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

		return new Promise((resolve, reject) => {
			this.db.run(query, [xpToAdd, teamId], (err) => {
				if (err) {
					reject(err);
				} else {
					this.getTeamById(teamId)
						.then(resolve)
						.catch(reject);
				}
			});
		});
	}

	async deleteTeam(id: number): Promise<boolean> {
		// Perform an explicit transactional delete to ensure related rows are removed
		const dbRef = this.db;
		return new Promise((resolve, reject) => {
			dbRef.serialize(() => {
				dbRef.run("BEGIN TRANSACTION");
				dbRef.run("DELETE FROM team_members WHERE team_id = ?", [id]);
				dbRef.run("DELETE FROM teams WHERE id = ?", [id], function(err) {
					if (err) {
						dbRef.run("ROLLBACK", () => {
							reject(err);
						});
					} else {
						dbRef.run("COMMIT", (cErr) => {
							if (cErr) return reject(cErr);
							resolve(this.changes > 0);
						});
					}
				});
			});
		});
	}

	// ===== TEAM MEMBERS =====

	async getTeamMembers(teamId: number): Promise<TeamMember[]> {
		const query = "SELECT * FROM team_members WHERE team_id = ?";
		return new Promise((resolve, reject) => {
			this.db.all(query, [teamId], (err, rows: TeamMember[]) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});
	}

	async isUserInTeam(teamId: number, userId: number): Promise<boolean> {
		const query = "SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1";
		return new Promise((resolve, reject) => {
			this.db.get(query, [teamId, userId], (err, row) => {
				if (err) return reject(err);
				resolve(!!row);
			});
		});
	}

	async getTeamByMember(userId: number): Promise<Team | null> {
		const query = `
			SELECT t.* FROM teams t
			JOIN team_members m ON t.id = m.team_id
			WHERE m.user_id = ?
			LIMIT 1
		`;
		return new Promise((resolve, reject) => {
			this.db.get(query, [userId], (err, row: Team | undefined) => {
				if (err) return reject(err);
				resolve(row || null);
			});
		});
	}

	async addTeamMember(teamId: number, userId: number): Promise<boolean> {
		const query = "INSERT OR REPLACE INTO team_members (team_id, user_id) VALUES (?, ?)";
		return new Promise((resolve, reject) => {
			this.db.run(query, [teamId, userId], function(err) {
				if (err) return reject(err);
				resolve(true);
			});
		});
	}

	async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
		const query = "DELETE FROM team_members WHERE team_id = ? AND user_id = ?";
		return new Promise((resolve, reject) => {
			this.db.run(query, [teamId, userId], function(err) {
				if (err) return reject(err);
				resolve(this.changes > 0);
			});
		});
	}



	async countTeamMembers(teamId: number): Promise<number> {
		const query = "SELECT COUNT(*) as cnt FROM team_members WHERE team_id = ?";
		return new Promise((resolve, reject) => {
			this.db.get(query, [teamId], (err, row: any) => {
				if (err) return reject(err);
				resolve(row ? row.cnt : 0);
			});
		});
	}

	// ===== QUEST METHODS =====

	async getAllQuests(): Promise<Quest[]> {
		const query = "SELECT * FROM quests";
		return new Promise((resolve, reject) => {
			this.db.all(query, [], (err, rows: Quest[]) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});
	}

	async getQuestById(id: number): Promise<Quest | null> {
		const query = "SELECT * FROM quests WHERE id = ?";
		return new Promise((resolve, reject) => {
			this.db.get(query, [id], (err, row: Quest | undefined) => {
				if (err) return reject(err);
				resolve(row || null);
			});
		});
	}

	async createQuest(q: QuestInsert): Promise<Quest> {
		const query = `INSERT INTO quests (name, place, clue, lore, time_limit, xp, pnj_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
		return new Promise((resolve, reject) => {
			this.db.run(query, [q.name, q.place, q.clue, q.lore, q.time_limit, q.xp, q.pnj_id ?? null], function(err) {
				if (err) return reject(err);
				db.getQuestById(this.lastID).then(resQ => resQ ? resolve(resQ) : reject(new Error('Failed to fetch created quest'))).catch(reject);
			});
		});
	}

	async updateQuest(id: number, q: Partial<QuestInsert>): Promise<Quest | null> {
		const updates: string[] = [];
		const values: any[] = [];
		if (q.name !== undefined) { updates.push('name = ?'); values.push(q.name); }
		if (q.place !== undefined) { updates.push('place = ?'); values.push(q.place); }
		if (q.clue !== undefined) { updates.push('clue = ?'); values.push(q.clue); }
		if (q.lore !== undefined) { updates.push('lore = ?'); values.push(q.lore); }
		if (q.time_limit !== undefined) { updates.push('time_limit = ?'); values.push(q.time_limit); }
		if (q.xp !== undefined) { updates.push('xp = ?'); values.push(q.xp); }
		if (q.pnj_id !== undefined) { updates.push('pnj_id = ?'); values.push(q.pnj_id); }

		if (updates.length === 0) return this.getQuestById(id);
		updates.push('updated_at = CURRENT_TIMESTAMP'); values.push(id);
		const query = `UPDATE quests SET ${updates.join(', ')} WHERE id = ?`;
		return new Promise((resolve, reject) => {
			this.db.run(query, values, (err) => {
				if (err) return reject(err);
				this.getQuestById(id).then(resolve).catch(reject);
			});
		});
	}

	async deleteQuest(id: number): Promise<boolean> {
		const query = 'DELETE FROM quests WHERE id = ?';
		return new Promise((resolve, reject) => {
			this.db.run(query, [id], function(err) {
				if (err) return reject(err);
				resolve(this.changes > 0);
			});
		});
	}

	// ===== ACTIVE QUESTS =====

	async getAllActiveQuests(): Promise<ActiveQuest[]> {
		const query = "SELECT * FROM active_quests";
		return new Promise((resolve, reject) => {
			this.db.all(query, [], (err, rows: ActiveQuest[]) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});
	}

	async getActiveQuestById(id: number): Promise<ActiveQuest | null> {
		const query = "SELECT * FROM active_quests WHERE id = ?";
		return new Promise((resolve, reject) => {
			this.db.get(query, [id], (err, row: ActiveQuest | undefined) => {
				if (err) return reject(err);
				resolve(row || null);
			});
		});
	}

	async createActiveQuest(aq: ActiveQuestInsert): Promise<ActiveQuest> {
		const status = aq.status ?? 'in_progress';
		const validated = aq.validated ? 1 : 0;
		const query = `INSERT INTO active_quests (quest_id, team_id, ends_at, status, validated) VALUES (?, ?, ?, ?, ?)`;
		return new Promise((resolve, reject) => {
			this.db.run(query, [aq.quest_id, aq.team_id, aq.ends_at, status, validated], function(err) {
				if (err) return reject(err);
				db.getActiveQuestById(this.lastID).then(resQ => resQ ? resolve(resQ) : reject(new Error('Failed to fetch created active quest'))).catch(reject);
			});
		});
	}

	async updateActiveQuest(id: number, a: Partial<ActiveQuestInsert> & { validated?: boolean }): Promise<ActiveQuest | null> {
		const updates: string[] = [];
		const values: any[] = [];
		if (a.quest_id !== undefined) { updates.push('quest_id = ?'); values.push(a.quest_id); }
		if (a.team_id !== undefined) { updates.push('team_id = ?'); values.push(a.team_id); }
		if (a.ends_at !== undefined) { updates.push('ends_at = ?'); values.push(a.ends_at); }
		if (a.status !== undefined) { updates.push('status = ?'); values.push(a.status); }
		if (a.validated !== undefined) { updates.push('validated = ?'); values.push(a.validated ? 1 : 0); }

		if (updates.length === 0) return this.getActiveQuestById(id);
		updates.push('updated_at = CURRENT_TIMESTAMP');
		values.push(id);
		const query = `UPDATE active_quests SET ${updates.join(', ')} WHERE id = ?`;
		return new Promise((resolve, reject) => {
			this.db.run(query, values, (err) => {
				if (err) return reject(err);
				this.getActiveQuestById(id).then(resolve).catch(reject);
			});
		});
	}

	async deleteActiveQuest(id: number): Promise<boolean> {
		const query = 'DELETE FROM active_quests WHERE id = ?';
		return new Promise((resolve, reject) => {
			this.db.run(query, [id], function(err) {
				if (err) return reject(err);
				resolve(this.changes > 0);
			});
		});
	}

	async getActiveQuestsByTeam(teamId: number): Promise<ActiveQuest[]> {
		const query = 'SELECT * FROM active_quests WHERE team_id = ?';
		return new Promise((resolve, reject) => {
			this.db.all(query, [teamId], (err, rows: ActiveQuest[]) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});
	}

	async getActiveQuestsByQuestId(questId: number): Promise<ActiveQuest[]> {
		const query = 'SELECT * FROM active_quests WHERE quest_id = ?';
		return new Promise((resolve, reject) => {
			this.db.all(query, [questId], (err, rows: ActiveQuest[]) => {
				if (err) return reject(err);
				resolve(rows || []);
			});
		});
	}

	close() {
		this.db.close((err) => {
			if (err) {
				console.error("Error closing database:", err);
			} else {
				console.log("Database connection closed");
			}
		});
	}
}


// Export a singleton instance
export const db = new Database();
