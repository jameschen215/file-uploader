import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// A `main` function so that we can use async/await
async function main() {
	const users = [
		{ email: 'alice@odin.com', name: 'Alice Johnson' },
		{ email: 'bod@odin.com', name: 'Bob Smith' },
	];

	// Seed the database with users and posts
	for (const user of users) {
		const u = await prisma.user.create({
			data: {
				email: user.email,
				name: user.name,
			},
		});

		console.log(`Created user: ${u.name}`);
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
