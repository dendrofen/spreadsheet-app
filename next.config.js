/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      jquery: 'jquery/dist/jquery.min.js',
      'jquery-mousewheel': 'jquery-mousewheel/jquery.mousewheel.min.js',
      luckysheet: 'luckysheet/dist/luckysheet.umd.js',
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/node_modules/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 