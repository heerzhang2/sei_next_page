/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',    //生成静态site,Node.js Server, /out/
  compiler: {
    relay: {
      src: "./",
      language: "typescript",
    },
  },
};

module.exports = nextConfig;
