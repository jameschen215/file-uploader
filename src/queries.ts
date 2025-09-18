import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// A `main` function so that we can use async/await
async function main() {
	// Retrieve all users
	const startTime = performance.now();

	const cachedUsers = await prisma.user.findMany({
		cacheStrategy: {
			swr: 30, // 30 seconds
			ttl: 60, // 60 seconds
		},
	});

	const endTime = performance.now();

	// Calculate the elapsed time
	const elapsedTime = endTime - startTime;

	console.log(`The query took ${elapsedTime}ms.`);
	console.log('It returned the following data:\n');
	for (const user of cachedUsers) {
		console.log(`Name: ${user.name} | Email: ${user.email}`);
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
