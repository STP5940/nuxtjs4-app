import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

async function seed() {
    const saltRounds = 10;
    
    await prisma.users.createMany({
        data: [
            {
                name: "Abdallah",
                email: "abdallah@gmail.com",
                password: await bcrypt.hash("password123", saltRounds),
                createdAt: new Date(),
            },
            {
                name: "Zaghloul",
                email: "zaghloul@gmail.com",
                password: await bcrypt.hash("password123", saltRounds),
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
