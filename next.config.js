/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /* config options here */
    images: {
        domains: ["firebasestorage.googleapis.com"]
    },
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,  
    },
    distDir: 'build'
  }
  
module.exports = nextConfig