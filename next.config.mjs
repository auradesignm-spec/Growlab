import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

const clerkCsp = [
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  "https://clerk.com",
  "https://api.clerk.com",
  "https://clerk-telemetry.com",
  "https://challenges.cloudflare.com",
].join(" ");

const ContentSecurityPolicy = [
  "default-src 'self'",
  isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${clerkCsp}`
    : `script-src 'self' 'unsafe-inline' ${clerkCsp}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com",
  "media-src 'self' blob:",
  `connect-src 'self' ${clerkCsp} wss://*.clerk.accounts.dev`,
  `frame-src 'self' ${clerkCsp}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // See ContentSecurityPolicy comment above — HSTS must never be sent over dev HTTP.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
    outputFileTracingIncludes: {
      "/*": ["./prisma/dev.db", "./prisma/schema.prisma"],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
