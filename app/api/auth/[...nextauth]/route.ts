import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/server/db";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        Credentials({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    // placeholder:"",
                },
                password: {
                    label: "Password",
                    type: "password",
                }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
                    return null;
                }

                return {
                    id: user.user_id,
                    email: user.email,
                    name: user.name,
                    randomKey: "Hey cool",
                };
            },
        })
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    randomKey: token.randomKey
                }
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    randomKey: (user as any).randomKey,
                };
            }

            return token;
        }
    },

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
