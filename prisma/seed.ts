import { hashPassword } from '../lib/auth';
import prisma from "../lib/prisma";
import { generateSecret } from 'node-2fa'

const APP_NAME = process.env.APP_NAME || 'AppNameEmpty';

async function seed() {
    // Clear existing data (order matters because of FKs)
    await prisma.twofactors.deleteMany({});
    await prisma.refreshtoken.deleteMany({});
    await prisma.tM_UsersrolePermissions.deleteMany({});
    await prisma.users.deleteMany({});
    await prisma.tM_Permissions.deleteMany({});
    await prisma.tM_Usersrole.deleteMany({});
    console.log("Delete existing data Success...");

    // define a common password for all users
    const passwordHash = await hashPassword("123456789");

    // Seed permissions (master)
    const permissionsData = [
        { codename: "settings_index", name: "ตั้งค่าทั่วไปโปรไฟล์", description: "Settings profile", canCreate: false, canRead: true, canUpdate: true, canDelete: false },
        { codename: "settings_security", name: "ตั้งค่าความปลอดภัย", description: "Security settings", canCreate: false, canRead: true, canUpdate: true, canDelete: false },
        { codename: "company_management", name: "จัดการบริษัท", description: "Manage company", canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        { codename: "employee_management", name: "จัดการพนักงานในบริษัท", description: "Manage employees in company", canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        { codename: "engagements_workpapers_settings", name: "ตั้งค่ากระดาษทำงาน", description: "Manage working papers", canCreate: true, canRead: true, canUpdate: true, canDelete: true },
        { codename: "engagements_workpapers_index", name: "กระดาษทำงาน", description: "Working paper questions", canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    ];

    await prisma.tM_Permissions.createMany({ data: permissionsData });

    const permissions = await prisma.tM_Permissions.findMany();
    const permissionMap = new Map(permissions.map((p) => [p.codename, p.permissionId]));

    // Seed roles (master)
    const rolesData = [
        { codename: "superadmin", name: "ผู้ดูแลระบบ", description: "Full access", level: 1 },
        { codename: "company", name: "ผู้ดูแลบริษัท", description: "Company access", level: 2 },
        { codename: "manager", name: "ผู้จัดการ", description: "Users manager", level: 3 },
        { codename: "review", name: "ผู้ตรวจสอบ", description: "Users review", level: 3 },
    ];

    await prisma.tM_Usersrole.createMany({ data: rolesData });

    const roles = await prisma.tM_Usersrole.findMany();
    const roleMap = new Map(roles.map((r) => [r.codename, r.usersroleId]));

    // Link roles to permissions
    const rolePermissionLinks: { role: string; permissions: string[] }[] = [
        { role: "superadmin", permissions: ["settings_index", "settings_security", "company_management", "employee_management", "engagements_workpapers_settings", "engagements_workpapers_index"] },
        { role: "company", permissions: ["settings_index", "settings_security", "employee_management", "engagements_workpapers_settings", "engagements_workpapers_index"] },
        { role: "manager", permissions: ["settings_index", "settings_security", "engagements_workpapers_settings"] },
        { role: "review", permissions: ["settings_index", "settings_security", "engagements_workpapers_index"] },
    ];

    const usersrolePermissionsData = rolePermissionLinks.flatMap((rp) => {
        const roleId = roleMap.get(rp.role);
        if (!roleId) return [];
        return rp.permissions
            .map((perm) => permissionMap.get(perm))
            .filter(Boolean)
            .map((permissionId) => ({
                usersroleId: roleId,
                permissionId: permissionId as string,
                allowCreate: permissions.find((p) => p.permissionId === permissionId)?.canCreate ?? false,
                allowRead: permissions.find((p) => p.permissionId === permissionId)?.canRead ?? false,
                allowUpdate: permissions.find((p) => p.permissionId === permissionId)?.canUpdate ?? false,
                allowDelete: permissions.find((p) => p.permissionId === permissionId)?.canDelete ?? false,
            }));
    });

    await prisma.tM_UsersrolePermissions.createMany({ data: usersrolePermissionsData });

    // Seed users with a single role each
    const usersData = [
        { name: "Anthony Fu", username: "antfu", email: "antfu@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/antfu", role: "company" },
        { name: "Baptiste Leproux", username: "larbish", email: "larbish@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/larbish", role: "manager" },
        { name: "Benjamin Canac", username: "benjamincanac", email: "benjamincanac@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/benjamincanac", role: "review" },
        { name: "Céline Dumerc", username: "celinedumerc", email: "celinedumerc@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/celinedumerc", role: "manager" },
        { name: "Daniel Roe", username: "danielroe", email: "danielroe@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/danielroe", role: "manager" },
        { name: "Farnabaz", username: "farnabaz", email: "farnabaz@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/farnabaz", role: "manager" },
        { name: "Ferdinand Coumau", username: "ferdinandcoumau", email: "FerdinandCoumau@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/FerdinandCoumau", role: "review" },
        { name: "Hugo Richard", username: "hugorcd", email: "hugorcd@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/hugorcd", role: "review" },
        { name: "Pooya Parsa", username: "pi0", email: "pi0@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/pi0", role: "manager" },
        { name: "Sarah Moriceau", username: "sarahm19", email: "SarahM19@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/SarahM19", role: "manager" },
        { name: "Sébastien Chopin", username: "atinux", email: "Atinux@example.com", avatar: "https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/atinux", role: "manager" },
    ];

    for (const user of usersData) {
        const roleId = roleMap.get(user.role);
        if (!roleId) throw new Error(`Role ${user.role} not found`);

        const createdUser = await prisma.users.create({
            data: {
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                password: passwordHash,
                createdAt: new Date(),
                usersroleId: roleId,
            },
        });

        const secretKey = generateSecret({ name: APP_NAME, account: user.email });

        await prisma.twofactors.create({
            data: {
                secret: secretKey.secret,
                userId: createdUser.userId,
                active: false,
                signinAccount: false,
                changePassword: false,
                createdAt: new Date(),
            },
        });
    }

    console.log("Insert Users, Roles, Permissions Success...");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
