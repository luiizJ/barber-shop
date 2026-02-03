import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // evita Clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Impede o navegador de "adivinhar" tipos de arquivo (evita XSS)
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Protege dados de referência
          },
        ],
      },
    ]
  },
}

export default nextConfig
