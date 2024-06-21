/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    plugins: [['@babel/plugin-transform-runtime']],
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
    async redirects() {
        return [
            // Basic redirect
            {
                source: '/',
                destination: '/chat',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
