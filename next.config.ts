import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: false,
  images: {
    qualities: [75, 100],
  },
  experimental: {
    // Zwiększamy limit dla Server Actions (domyślnie 1MB, logo może ważyć do 2MB)
    serverActions: {
      bodySizeLimit: '5mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

export default nextConfig;