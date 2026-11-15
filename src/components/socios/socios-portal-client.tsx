"use client";

import dynamic from "next/dynamic";

/** Pantalla de carga mientras se monta el portal en el navegador. */
function PortalLoader() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-ink" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/stampa-gym-logo.svg"
          alt="Stampa Gym"
          className="h-12 w-auto animate-pulse"
        />
        <span className="label-xs text-fog">Cargando portal de socios…</span>
      </div>
    </div>
  );
}

/**
 * El portal usa localStorage como base de datos simulada, por eso se renderiza
 * únicamente en el cliente (ssr: false).
 */
const SociosPortal = dynamic(
  () => import("./socios-portal").then((modulo) => modulo.SociosPortal),
  {
    ssr: false,
    loading: () => <PortalLoader />,
  },
);

export function SociosPortalClient({ heroImage }: { heroImage: string }) {
  return <SociosPortal heroImage={heroImage} />;
}
