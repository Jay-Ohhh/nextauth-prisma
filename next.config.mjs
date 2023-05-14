/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./env/server.mjs"));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    output: "standalone",
    // gzip by nginx
    // compress: false,
    sassOptions: {
        prependData: `$basePath: '${process.env.NEXT_PUBLIC_BASE_PATH || ""}';`,
    },
    // experimental: {
    //     serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
    // }
};

export default nextConfig;
