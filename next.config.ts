// import type { NextConfig } from "next";

// // L'opérateur '!' garantit que la valeur n'est pas undefined
// const ip: string = process.env.NEXT_PUBLIC_IP_BACKEND!;
// const port: string = process.env.NEXT_PUBLIC_PORT_BACKEND!;

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: ip, // TypeScript est satisfait
//         port: port,   // TypeScript est satisfait
//       },
//     ],
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";

// L'opérateur '!' garantit que la valeur n'est pas undefined
const ip: string = process.env.NEXT_PUBLIC_IP_BACKEND!;
const port: string = process.env.NEXT_PUBLIC_PORT_BACKEND!;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Utilisez 'http' car votre URL est en http://
        hostname: ip, // 👈 L'adresse IP de votre backend
        port: port, // 👈 Le port de votre backend
        pathname: '/photo/**', // Chemin spécifique ou '/**' pour tout autoriser
      },
      // Si vous utilisez localhost pour le développement, ajoutez-le aussi
      {
        protocol: 'http',
        hostname: ip, // TypeScript est satisfait
        port: port,   // TypeScript est satisfait
      },
    ],
  },
};

export default nextConfig;