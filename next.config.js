/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverMinification: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/vacai/results/*.{jpg,jpeg,png,webp}",
      },
    ],
  },
};

module.exports = nextConfig;
