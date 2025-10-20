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
	leader_id: number;
	guild_id: number;
	state_lock: boolean;
	xp: number;
	created_at?: string;
	updated_at?: string;
}

export interface TeamInsert {
	leader_id: number;
	guild_id: number;
	state_lock?: boolean;
	xp?: number;
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
				this.initializeDatabase();
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
				leader_id INTEGER NOT NULL,
				guild_id INTEGER NOT NULL,
				state_lock BOOLEAN DEFAULT 0,
				xp INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
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

	async getTeamByLeader(leaderId: number): Promise<Team | null> {
		const query = "SELECT * FROM teams WHERE leader_id = ?";
		
		return new Promise((resolve, reject) => {
			this.db.get(query, [leaderId], (err, row: Team | undefined) => {
				if (err) {
					reject(err);
				} else {
					resolve(row || null);
				}
			});
		});
	}

	async createTeam(teamData: TeamInsert): Promise<Team> {
		const query = `
			INSERT INTO teams (leader_id, guild_id, state_lock, xp)
			VALUES (?, ?, ?, ?)
		`;

		const stateLock = teamData.state_lock ?? false;
		const xp = teamData.xp ?? 0;

		return new Promise((resolve, reject) => {
			this.db.run(
				query,
				[teamData.leader_id, teamData.guild_id, stateLock, xp],
				function(err) {
					if (err) {
						reject(err);
					} else {
						db.getTeamById(this.lastID)
							.then(team => {
								if (team) {
									resolve(team);
								} else {
									reject(new Error("Failed to retrieve created team"));
								}
							})
							.catch(reject);
					}
				}
			);
		});
	}

	async updateTeam(id: number, teamData: Partial<TeamInsert> & { xp?: number; state_lock?: boolean }): Promise<Team | null> {
		const updates: string[] = [];
		const values: any[] = [];

		if (teamData.leader_id !== undefined) {
			updates.push("leader_id = ?");
			values.push(teamData.leader_id);
		}
		if (teamData.guild_id !== undefined) {
			updates.push("guild_id = ?");
			values.push(teamData.guild_id);
		}
		if (teamData.state_lock !== undefined) {
			updates.push("state_lock = ?");
			values.push(teamData.state_lock ? 1 : 0);
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
		const query = "DELETE FROM teams WHERE id = ?";

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
