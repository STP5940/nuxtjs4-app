import { hashPassword } from '../lib/auth';
import prisma from "../lib/prisma";

async function seed() {
    await prisma.users.createMany({
        data: [
            {
                name: "Abdallah",
                email: "abdallah@gmail.com",
                password: await hashPassword("password123"),
                createdAt: new Date(),
            },
            {
                name: "Zaghloul",
                email: "zaghloul@gmail.com",
                password: await hashPassword("password123"),
                createdAt: new Date(),
            },
        ],
    });
}

seed()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });

console.log("Insert Users Success...");
