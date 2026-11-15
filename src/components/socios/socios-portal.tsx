"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DashboardView } from "./dashboard-view";
import { LoginView, type OrigenTransicion } from "./login-view";
import { primerNombre } from "@/lib/socios/formato";
import { cerrarSesion, restaurarSesion, type SocioRegistro } from "@/lib/socios/mock-db";

const DURACION_EXPANSION_MS = 800;
const DURACION_SALIDA_MS = 600;

type Transicion = {
  fase: "expandiendo" | "saliendo";
  origen: OrigenTransicion;
  nombre: string;
};

/**
 * Controlador del portal: Login → (expansión a pantalla completa) → Dashboard.
 * Si ya hay una sesión guardada, entra directo al dashboard.
 */
export function SociosPortal({ heroImage }: { heroImage: string }) {
  const [socio, setSocio] = useState<SocioRegistro | null>(() => restaurarSesion());
  const [pendiente, setPendiente] = useState<SocioRegistro | null>(null);
  const [transicion, setTransicion] = useState<Transicion | null>(null);

  useEffect(() => {
    if (!transicion) return;

    if (transicion.fase === "expandiendo") {
      const temporizador = window.setTimeout(() => {
        setSocio(pendiente);
        setPendiente(null);
        setTransicion({ ...transicion, fase: "saliendo" });
      }, DURACION_EXPANSION_MS);
      return () => window.clearTimeout(temporizador);
    }

    const temporizador = window.setTimeout(() => setTransicion(null), DURACION_SALIDA_MS);
    return () => window.clearTimeout(temporizador);
  }, [transicion, pendiente]);

  function iniciarSesion(nuevo: SocioRegistro, origen: OrigenTransicion) {
    const reducirMovimiento = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducirMovimiento) {
      setSocio(nuevo);
      return;
    }
    setPendiente(nuevo);
    setTransicion({ fase: "expandiendo", origen, nombre: primerNombre(nuevo.nombre) });
  }

  function salir() {
    cerrarSesion();
    setSocio(null);
  }

  return (
    <>
      {socio ? (
        <DashboardView socio={socio} onSocioChange={setSocio} onLogout={salir} />
      ) : (
        <div className="portal-fade-in">
          <LoginView heroImage={heroImage} onLogin={iniciarSesion} />
        </div>
      )}

      {transicion && (
        <div
          aria-hidden="true"
          className={`portal-expand ${transicion.fase === "saliendo" ? "portal-expand--out" : ""}`}
          style={
            {
              "--x": `${transicion.origen.x}px`,
              "--y": `${transicion.origen.y}px`,
            } as CSSProperties
          }
        >
          <div className="portal-expand__content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/stampa-gym-logo.svg"
              alt=""
              className="mx-auto h-14 w-auto brightness-0 sm:h-16"
            />
            <p className="mt-6 text-[clamp(2.2rem,7vw,4rem)] font-black uppercase leading-none tracking-[-0.04em] text-ink">
              Hola, {transicion.nombre}
            </p>
            <p className="label-xs mt-4 text-ink/70">Abriendo tu panel de socio…</p>
          </div>
        </div>
      )}
    </>
  );
}
