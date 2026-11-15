import Link from "next/link";

type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

/**
 * Logo oficial de Stampa Gym. Si existe /public/brand/stampa-gym-logo.png
 * puedes cambiar `src` para usar la versión raster original.
 */
export function Logo({ href = "/", compact = false, className = "" }: LogoProps) {
  return (
    <Link href={href} aria-label="Stampa Gym — inicio" className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/stampa-gym-logo.svg"
        alt="Stampa Gym"
        width={compact ? 96 : 128}
        height={compact ? 36 : 48}
        className={compact ? "h-8 w-auto" : "h-10 w-auto sm:h-12"}
      />
    </Link>
  );
}
