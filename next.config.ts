import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default withSentryConfig(nextConfig, {
  org: "shiroy",
  project: "dreamboard",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});
