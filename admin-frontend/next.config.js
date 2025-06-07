/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GRAPHQL_ENDPOINT:
            process.env.GRAPHQL_ENDPOINT || "http://localhost:4001/graphql",
    },
};

module.exports = nextConfig;
