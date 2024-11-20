/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Enforce React strict mode
    images: {
        domains: ['example.com'], // Allow image optimization from external domains
    },
};

export default nextConfig
