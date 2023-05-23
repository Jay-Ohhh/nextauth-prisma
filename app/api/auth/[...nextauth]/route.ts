import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/server/db";
import bcrypt from "bcrypt";
import JSEncrypt from "jsencrypt/lib";
import { env } from "@/env/server.mjs";

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        // popup login: https://github.com/arye321/nextauth-google-popup-login
        // GoogleProvider 在国内不一定能用
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        GitHubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
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

                if (!user) {
                    return null;
                }

                const decrypt = new JSEncrypt();
                decrypt.setPrivateKey(env.RSA_PRIVATE_KEY);
                const pwd = decrypt.decrypt(credentials.password) as string;

                if (! await bcrypt.compare(pwd, user.password)) {
                    return null;
                }

                // Any object returned will be saved in `user` property of the JWT
                // and will be pass to jwt callback
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
            // The session callback is called whenever a session is checked.
            // e.g. getSession(), getServerSession(), useSession(), /api/auth/session
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    randomKey: token.randomKey
                }
            };
        },
        jwt: async ({ token, user, account, profile }) => {
            if (user?.email && account?.type === "oauth") {
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name!,
                        avatar: user.image,
                    },
                    create: {
                        name: user.name!,
                        email: user.email,
                        password: "",
                        avatar: user.image,
                    },
                });
            }
            // token will be pass to session callback
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
