import { db } from "./database";

// Seed guilds with example data
const seedGuilds = async () => {
	const guilds = [
		{
			name: "La Guilde des Pétrisseurs d'Aurore",
			image: "",
			motto: "Le code se lève toujours pour ceux qui le font cuire avec passion.",
			description: "Autrefois maîtres du levain et du four, les Pétrisseurs ont troqué la farine contre les lignes de code. Ils croient que la patience et la précision sont les clés de toute création — qu'il s'agisse de pain ou de programmes. On dit qu'ils testent leur code comme ils goûtaient leur pâte : jusqu'à ce qu'il soit parfaitement croustillant.",
			primary_color: "#D2691E",
			place: "Ancienne boulangerie",
			old_job: "Boulangers"
		},
		{
			name: "La Guilde des Jardiniers du Système",
			image: "",
			motto: "Sème des idées, fais pousser des projets.",
			description: "Ces gardiens du vivant voient le code comme un jardin : il faut le planter avec soin, le nourrir, et couper les mauvaises herbes (les bugs). Ils sont calmes, méthodiques et incroyablement patients. Quand un problème semble insoluble, les Jardiniers du Système savent qu'il suffit parfois… d'un bon arrosage logique.",
			primary_color: "#228B22",
			place: "Forêt après l'école",
			old_job: "Jardiniers / Cultivateurs"
		},
		{
			name: "La Guilde des Forgerons de Syntaxe",
			image: "",
			motto: "Frappe le bug tant qu'il est chaud.",
			description: "Puissants et déterminés, les Forgerons considèrent le code comme une matière brute à dompter. Ils sculptent des programmes solides, optimisés, capables de résister à toutes les erreurs de compilation. Leur atelier résonne du son des claviers comme autrefois de l'acier.",
			primary_color: "#8B4513",
			place: "Portail",
			old_job: "Forgerons / Artisans du métal"
		},
		{
			name: "La Guilde des Scribes du Savoir",
			image: "",
			motto: "Lire, comprendre, coder, transmettre.",
			description: "Les Scribes maîtrisent la logique et les algorithmes comme d'autres manient la plume. Ils enregistrent chaque découverte, documentent chaque ligne de code, et guident les nouveaux aventuriers. On les dit un peu trop bavards… mais toujours indispensables.",
			primary_color: "#4169E1",
			place: "Accueil",
			old_job: "Érudits / Enseignants / Bibliothécaires"
		},
		{
			name: "La Guilde des Tisseurs de Pixel",
			image: "",
			motto: "Le beau inspire le code, le code révèle le beau.",
			description: "Créatifs, rêveurs, un peu excentriques, les Tisseurs de Pixel voient le code comme un art visuel. Leur spécialité : le design, les interfaces et les animations qui donnent vie aux applications. Ils sont les architectes de l'esthétique numérique.",
			primary_color: "#FF1493",
			place: "TUMO",
			old_job: "Artistes / Peintres / Graphistes"
		}
	];

	try {
		const existingGuilds = await db.getAllGuilds();
		
		if (existingGuilds.length > 0) {
			console.log("Guilds already exist, skipping seed...");
			return;
		}

		console.log("Seeding guilds...");
		
		for (const guild of guilds) {
			await db.createGuild(guild);
			console.log(`Created guild: ${guild.name}`);
		}

		console.log("Guilds seeded successfully!");
	} catch (error) {
		console.error("Error seeding guilds:", error);
	}
};

// Execute seed if run directly
if (require.main === module) {
	seedGuilds().then(() => {
		console.log("Seed completed!");
		process.exit(0);
	}).catch((error) => {
		console.error("Seed failed:", error);
		process.exit(1);
	});
}

export { seedGuilds };
