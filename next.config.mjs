/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Phase 9.6: Performance Optimization ─────────────────────────────────
  
  // Compress responses
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Experimental: faster builds
  experimental: {
    optimizePackageImports: ["react-icons", "recharts", "react-hot-toast"],
  },
};

export default nextConfig;
