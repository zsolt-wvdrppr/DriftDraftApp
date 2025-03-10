/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['flagcdn.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'flagcdn.com',
                pathname: '**',
            },
        ],
    },
};

export default nextConfig;