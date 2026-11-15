import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Stampa Wellness Gym · Entrena sin ruido",
    template: "%s · Stampa Wellness Gym",
  },
  description:
    "Gimnasio en Cochabamba, Bolivia: sala de fuerza, funcional, Technogym, wellness y un portal de socios con Rasca y Gana semanal.",
  keywords: ["gimnasio Cochabamba", "gym Bolivia", "wellness", "Technogym", "entrenamiento personal", "Stampa"],
  openGraph: {
    title: "Stampa Wellness Gym",
    description: SITE.claim,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-ink text-white antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-acid focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink"
        >
          Saltar al contenido
        </a>
        {children}
        <WhatsAppFab />
      </body>
    </html>
  );
}
