/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  typescript: {
    // WARN Ignoring typescript build error please change in production
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
