import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Fotos reales del gimnasio. Colócalas en /public/images con estos nombres:
 *  - sala-principal.jpg   (vista general con máquinas amarillas)
 *  - zona-maquinas.jpg    (máquinas Technogym / zona cardio)
 *  - zona-piernas.jpg     (prensas amarillas junto al ventanal)
 *  - mancuernas-1.jpg     (rack de mancuernas Ivanko)
 *  - mancuernas-2.jpg     (rack de mancuernas pesadas)
 * Si un archivo no existe se usa la imagen de respaldo.
 */
export function localImage(file: string, fallback: string): string {
  const absolute = path.join(process.cwd(), "public", "images", file);
  return existsSync(absolute) ? `/images/${file}` : fallback;
}
