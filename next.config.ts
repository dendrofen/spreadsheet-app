/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config: any) => {
    config.externals = [...config.externals, 'luckysheet'];
    return config;
  },
};

export default nextConfig;
