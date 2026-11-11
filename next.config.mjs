/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'gravatar.com',
      'www.gravatar.com', // optional but safer
    ],
  },
};

export default nextConfig;