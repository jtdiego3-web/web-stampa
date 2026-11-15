import type { Metadata } from "next";
import { SociosPortalClient } from "@/components/socios/socios-portal-client";
import { localImage } from "@/lib/local-images";
import { IMAGES } from "@/lib/site";
import "./socios.css";

export const metadata: Metadata = {
  title: "Portal de socios",
  description:
    "Panel de socio a pantalla completa: datos, plan, asistencias semanales y Rasca y Gana con premios sorpresa.",
};

export default function SociosPage() {
  return <SociosPortalClient heroImage={localImage("zona-maquinas.jpg", IMAGES.heroSecondary)} />;
}
