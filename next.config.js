/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wordpress2533583.home.pl',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'swewoocommerce.dfweb.no',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle GLTF/GLB files for 3D models
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });

    // Optimize Three.js for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  // Experimental Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        '*.glb': {
          loaders: ['file-loader'],
          as: '*.js',
        },
        '*.gltf': {
          loaders: ['file-loader'],
          as: '*.js',
        },
      },
    },
  },
};

module.exports = nextConfig;
