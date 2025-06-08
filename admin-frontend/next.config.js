/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GRAPHQL_ENDPOINT:
            process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT ||
            process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
            "http://localhost:4002/graphql",
    },
};

module.exports = nextConfig;
