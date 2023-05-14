import { prisma } from "@/server/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import JSEncrypt from "jsencrypt";
import { env } from "@/env/server.mjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = (await req.json()) as {
            name: string;
            email: string;
            password: string;
        };

        const _user = await prisma.user.findUnique({
            where: { email, }
        });

        if (_user) {
            return new NextResponse(
                JSON.stringify({
                    status: "error",
                    message: "User is existed",
                }),
                { status: 400 }
            );
        }

        const decrypt = new JSEncrypt();
        decrypt.setPrivateKey(env.RSA_PRIVATE_KEY);
        const hashPwd = bcrypt.hashSync(decrypt.decrypt(password) as string, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPwd
            }
        });

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
            }
        });
    } catch (e: any) {
        return new NextResponse(
            JSON.stringify({
                status: "error",
                message: e.message,
            }),
            { status: 500 }
        );
    }
}