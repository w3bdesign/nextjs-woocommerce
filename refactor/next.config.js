/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'swewoocommerce.dfweb.no',
      'res.cloudinary.com',
      'via.placeholder.com',
    ],
  },
};

module.exports = nextConfig;
