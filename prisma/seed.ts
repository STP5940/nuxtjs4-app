import { hashPassword } from '../lib/auth';
import prisma from "../lib/prisma";
import { generateSecret } from 'node-2fa'

const APP_NAME = process.env.APP_NAME || 'AppNameEmpty';

async function seed() {
    // Clear existing data
    await prisma.twofactor.deleteMany({});
    console.log("Delete Twofactor Success...");
    await prisma.users.deleteMany({});
    console.log("Delete Users Success...");

    // define a common password for all users
    const passwordHash = await hashPassword("123456789");

    await prisma.users.createMany({
        data: [
            {
                name: "Anthony Fu",
                username: 'antfu',
                email: "antfu@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/antfu",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Baptiste Leproux",
                username: 'larbish',
                email: "larbish@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/larbish",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Benjamin Canac",
                username: 'benjamincanac',
                email: "benjamincanac@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/benjamincanac",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Céline Dumerc",
                username: 'celinedumerc',
                email: "celinedumerc@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/celinedumerc",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Daniel Roe",
                username: 'danielroe',
                email: "danielroe@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/danielroe",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Farnabaz",
                username: 'farnabaz',
                email: "farnabaz@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/farnabaz",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Ferdinand Coumau",
                username: 'ferdinandcoumau',
                email: "FerdinandCoumau@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/FerdinandCoumau",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Hugo Richard",
                username: 'hugorcd',
                email: "hugorcd@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/hugorcd",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Pooya Parsa",
                username: 'pi0',
                email: "pi0@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/pi0",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Sarah Moriceau",
                username: 'sarahm19',
                email: "SarahM19@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/SarahM19",
                password: passwordHash,
                createdAt: new Date(),
            },
            {
                name: "Sébastien Chopin",
                username: 'atinux',
                email: "Atinux@example.com",
                avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/atinux",
                password: passwordHash,
                createdAt: new Date(),
            },
        ],
    });

    console.log("Insert Users Success...");

    // Get all created users
    const users = await prisma.users.findMany();

    // Create Twofactor records for each user
    for (const user of users) {
        const secretKey = generateSecret({ name: APP_NAME, account: user.email });

        await prisma.twofactor.create({
            data: {
                secret: secretKey.secret,
                userid: user.id,
                active: false,
                signinaccount: false,
                changepassword: false,
            },
        });
    }

    console.log("Insert Twofactor Records Success...");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
