import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const saltRounds = 10;
const adminPwd = 'admin123456';

const prisma = new PrismaClient();

async function main() {
    bcrypt.hash(adminPwd, saltRounds, async function (err, hash) {
        // Store hash in your password DB.

        const user = await prisma.user.upsert({
            where: { email: "admin@admin.com" },
            update: {},
            create: {
                email: "admin@admin.com",
                name: "Admin",
                password: hash,
            },
        });

        console.log({ user });
    });
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
