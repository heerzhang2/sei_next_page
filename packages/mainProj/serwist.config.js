import crypto from "crypto";

const revision = crypto.randomUUID();

/** @type {import("serwist").SerwistOptions} */
export default {
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: false,
  cacheOnNavigation: false,
  register: true,
  maximumFileSizeToCacheInBytes: 9000000, // 减小到9MB
  additionalPrecacheEntries: [
    { url: "/", revision },
    { url: "/login", revision },
    { url: "/~offline", revision },
    { url: "/offline", revision },
  ],
};
