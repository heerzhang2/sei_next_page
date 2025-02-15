/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    relay: {
      src: './',
      artifactDirectory: './__generated__',
      language: 'typescript',
      eagerEsModules: false,
    },
  },
};

module.exports = nextConfig;
