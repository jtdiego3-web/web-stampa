import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las imágenes se sirven directamente desde el CDN para no depender del
    // optimizador en entornos de preview.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async redirects() {
    // El dashboard ahora vive dentro de /socios (login → dashboard sin recargar).
    return [{ source: "/socios/panel", destination: "/socios", permanent: false }];
  },
};

export default nextConfig;
