/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["echo-ui", "echo-core", "echo-score"],
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
