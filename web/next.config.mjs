/** @type {import('next').NextConfig} */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  outputFileTracingRoot: appDirectory,
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
