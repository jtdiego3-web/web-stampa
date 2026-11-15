import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { Logo } from "@/components/logo";
import { NewsletterPopup } from "@/components/newsletter-popup";
import { SiteHeader } from "@/components/site-header";
import { localImage } from "@/lib/local-images";
import { PRICING } from "@/lib/plans";
import { PRIZE_LIST } from "@/lib/prizes";
import { FACILITIES, FAQS, IMAGES, NAV_LINKS, SCHEDULE, SITE, TRAINERS, whatsappLink } from "@/lib/site";

const STATS = [
  { value: "1.200", unit: "m²", label: "de club sin masificar" },
  { value: "6", unit: "/7", label: "días de apertura" },
  { value: "26", unit: "sesiones", label: "en el plan mensual" },
  { value: "100", unit: "%", label: "seguimiento humano" },
];

const PRIZE_EMOJIS = ["☕", "🏋️", "🥪", "🍫", "🍩", "🎟️", "🏆"];

export default function HomePage() {
  const photos = {
    hero: localImage("sala-principal.jpg", IMAGES.hero),
    machines: localImage("zona-maquinas.jpg", IMAGES.cardio),
    legs: localImage("zona-piernas.jpg", IMAGES.functional),
    dumbbells1: localImage("mancuernas-1.jpg", IMAGES.strength),
    dumbbells2: localImage("mancuernas-2.jpg", IMAGES.wellness),
  };
  const facilityImages = [photos.legs, photos.dumbbells1, photos.machines];
  const gallery = [
    { src: photos.hero, alt: "Sala principal con máquinas de fuerza", wide: true },
    { src: photos.machines, alt: "Zona de máquinas Technogym y cardio", wide: false },
    { src: photos.legs, alt: "Prensas y máquinas de pierna", wide: false },
    { src: photos.dumbbells1, alt: "Rack de mancuernas Ivanko", wide: false },
    { src: photos.dumbbells2, alt: "Mancuernas pesadas hasta 100 lb", wide: true },
  ];

  return (
    <>
      <SiteHeader />
      <NewsletterPopup />

      <main id="contenido">
        {/* HERO */}
        <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-8 pt-28 sm:pb-10 sm:pt-32">
          <Image
            src={photos.hero}
            alt="Sala principal de Stampa Gym en Cochabamba"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/55 to-ink" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_20%,rgba(230,255,60,0.12),transparent_55%)]" />

          <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
            <div className="animate-fade-up max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                  <span className="label-xs text-white/80">Cochabamba · Plaza Colón</span>
                </span>
                <span className="label-xs hidden text-fog sm:inline">Desde 2019</span>
              </div>

              <h1 className="mt-6 text-[clamp(2.7rem,7.4vw,5.4rem)] font-black uppercase leading-[0.9] tracking-[-0.04em] text-white">
                Tu mejor versión
                <br />
                no se compra.
                <br />
                <span className="text-acid">Se entrena.</span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mist sm:text-base">
                Fuerza, funcional y wellness en un club pensado para entrenar bien, no para hacer
                cola. Entra con tu código de socio y comprueba cuánto has avanzado esta semana.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="#instalaciones"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-acid px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
                >
                  Descubrir el club
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                    <path
                      d="M8 2v11M4 9l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/socios"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/25 bg-white/[0.04] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur transition-colors hover:border-acid hover:text-acid"
                >
                  Ya soy socio
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] tracking-[0.1em]">
                    Portal
                  </span>
                </Link>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-mist underline decoration-acid/50 decoration-2 underline-offset-4 transition-colors hover:text-acid"
              >
                ¿Dudas con tu plan? Escríbenos por WhatsApp
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-white/12 pt-6 sm:mt-16 sm:grid-cols-4 sm:gap-6">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dd className="flex items-baseline gap-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {stat.value}
                    <span className="text-xs font-semibold uppercase tracking-wider text-acid">
                      {stat.unit}
                    </span>
                  </dd>
                  <dt className="mt-1 text-[10.5px] uppercase leading-tight tracking-[0.12em] text-fog">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* TICKER */}
        <div className="relative overflow-hidden border-y border-acid/40 bg-acid py-3 text-ink">
          <div className="flex w-max animate-marquee items-center gap-8 pr-8">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
                {[
                  "Entrena sin ruido",
                  "Technogym",
                  "Wellness real",
                  "Rasca y Gana semanal",
                  "Coaching 1:1",
                  "Café de especialidad",
                  "6 días a la semana",
                ].map((word) => (
                  <span
                    key={`${copy}-${word}`}
                    className="flex items-center gap-8 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.22em]"
                  >
                    {word}
                    <span className="text-[14px] leading-none">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* MANIFIESTO */}
        <section className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <span className="label-xs text-acid">El club</span>
              <h2 className="mt-4 max-w-2xl text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                Menos postureo.
                <br />
                Más <span className="text-acid">kilos bien movidos.</span>
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-sm leading-relaxed text-fog sm:text-[15px]">
                Stampa nació de una idea simple: un gimnasio donde el equipo técnico te conoce por
                tu nombre, donde nunca esperas para una jaula y donde la recuperación forma parte
                del entrenamiento.
              </p>
              <p className="text-sm leading-relaxed text-fog sm:text-[15px]">
                Sin contratos eternos, sin clases masificadas. Solo tú, tu plan y un equipo que
                lleva la cuenta de lo que haces.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Sala de fuerza", "Funcional", "Cardio conectado", "Sauna", "Wellness Bar"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mist"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        {/* INSTALACIONES */}
        <section id="instalaciones" className="mx-auto w-full max-w-[1320px] px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
            <div>
              <span className="label-xs text-acid">01 — Instalaciones</span>
              <h2 className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                Espacios que
                <br />
                acompañan.
              </h2>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-fog">
              Todo el equipamiento es Technogym y se revisa cada semana. La luz, la música y la
              temperatura también entrenan.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map((facility, index) => (
              <article
                key={facility.title}
                className="group relative isolate overflow-hidden rounded-[20px] border border-white/10"
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={facilityImages[index] ?? facility.image}
                    alt={facility.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="flex items-center justify-between">
                    <span className="label-xs text-acid">0{index + 1}</span>
                    <span className="rounded-full border border-white/20 bg-ink/40 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-mist backdrop-blur">
                      {facility.meta}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-white">
                    {facility.title}
                  </h3>
                  <p className="mt-1.5 max-h-0 overflow-hidden text-xs leading-relaxed text-mist opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                    {facility.copy}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-fog sm:hidden">
                    {facility.copy}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* GALERÍA */}
        <section aria-labelledby="galeria-title" className="mx-auto w-full max-w-[1320px] px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 id="galeria-title" className="text-[clamp(1.6rem,3.4vw,2.4rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]">
              Así es <span className="text-acid">Stampa por dentro</span>
            </h2>
            <p className="max-w-xs text-xs leading-relaxed text-fog">
              Edificio Venus, Plaza Colón · Cochabamba.
            </p>
          </div>
          <div className="grid auto-rows-[200px] grid-cols-1 gap-3 sm:auto-rows-[240px] sm:grid-cols-3">
            {gallery.map((item) => (
              <figure
                key={item.alt}
                className={`group relative overflow-hidden rounded-[18px] border border-white/10 ${item.wide ? "sm:col-span-2" : ""}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-mist">
                  {item.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ENTRENADORES */}
        <section
          id="entrenadores"
          className="border-y border-white/8 bg-coal px-5 py-20 sm:px-8 sm:py-28"
        >
          <div className="mx-auto w-full max-w-[1320px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
              <div>
                <span className="label-xs text-acid">02 — Entrenadores</span>
                <h2 className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                  Gente que
                  <br />
                  te mira entrenar.
                </h2>
              </div>
              <p className="max-w-xs text-xs leading-relaxed text-fog">
                Tres perfiles, una misma obsesión: la técnica. La primera sesión de bienvenida
                siempre es con un entrenador.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TRAINERS.map((trainer) => (
                <article
                  key={trainer.name}
                  className="group overflow-hidden rounded-[20px] border border-white/10 bg-graphite"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={trainer.image}
                      alt={`${trainer.name}, ${trainer.role}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover grayscale-[0.25] transition-all duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-acid px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink">
                      {trainer.tags[0]}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold tracking-tight">{trainer.name}</h3>
                    <p className="label-xs mt-1.5 text-acid">{trainer.role}</p>
                    <p className="mt-3 text-xs leading-relaxed text-fog">{trainer.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section id="planes" className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-8 max-w-2xl sm:mb-12">
            <span className="label-xs text-acid">03 — Planes</span>
            <h2 className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
              Elige tu plan
              <br />
              <span className="text-acid">y empieza hoy.</span>
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {PRICING.map((group) => (
              <div
                key={group.id}
                className={`flex flex-col rounded-[24px] border p-6 sm:p-7 ${
                  group.featured ? "border-acid/60 bg-acid text-ink" : "border-white/12 bg-graphite text-white"
                }`}
              >
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.12em] ${
                    group.featured ? "bg-ink text-acid" : "bg-white/10 text-acid"
                  }`}
                >
                  {group.period}
                </span>
                <h3 className="mt-4 text-3xl font-black uppercase tracking-[-0.02em]">{group.name}</h3>
                <p className={`mt-2 text-sm ${group.featured ? "text-ink/75" : "text-fog"}`}>{group.tagline}</p>

                <ul className={`mt-6 divide-y ${group.featured ? "divide-ink/15" : "divide-white/10"}`}>
                  {group.options.map((option) => (
                    <li key={option.label} className="flex items-center justify-between gap-3 py-3.5">
                      <div>
                        <p className="text-[14px] font-bold">{option.label}</p>
                        <p className={`text-[11px] ${group.featured ? "text-ink/60" : "text-fog"}`}>{option.detail}</p>
                      </div>
                      <p className="shrink-0 text-2xl font-black tracking-tight">
                        {option.price}
                        <span className="ml-1 text-sm font-bold">Bs</span>
                      </p>
                    </li>
                  ))}
                </ul>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto inline-flex items-center justify-center rounded-full px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                    group.featured ? "mt-6 bg-ink text-white hover:bg-graphite" : "mt-6 bg-acid text-ink hover:bg-white"
                  }`}
                >
                  Inscribirme por WhatsApp
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* GAMIFICACIÓN */}
        <section className="relative overflow-hidden border-y border-white/8 bg-coal px-5 py-20 sm:px-8 sm:py-28">
          <div className="pointer-events-none absolute -right-24 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-acid/10 blur-[120px]" />
          <div className="mx-auto grid w-full max-w-[1320px] gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <span className="label-xs text-acid">04 — Portal de socios</span>
              <h2 className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                Ven a entrenar.
                <br />
                <span className="text-acid">Rasca. Gana.</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-fog sm:text-[15px]">
                Cada semana que registres asistencia se activa una casilla de rasca en tu portal.
                Cuantos más días vengas, más peso tienen los premios altos: descuentos del 10 % y
                20 % para tu renovación.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { step: "01", title: "Entra con tu código", copy: "Acceso privado con tu código de inscrito." },
                  { step: "02", title: "Registra sesiones", copy: "El contador suma tus 6 días semanales." },
                  { step: "03", title: "Rasca el premio", copy: "Email con el código de canje al instante." },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <span className="text-[10px] font-bold tracking-[0.2em] text-acid">
                      {item.step}
                    </span>
                    <p className="mt-2 text-[13px] font-semibold leading-snug text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-fog">{item.copy}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/socios"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-acid px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
              >
                Probar el Rasca y Gana
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path
                    d="M2 8h11M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="relative">
              <div className="animate-float rounded-[26px] border border-white/12 bg-gradient-to-b from-graphite to-coal p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="label-xs text-fog">Stampa Rewards</span>
                  <span className="rounded-full bg-acid/15 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-acid">
                    Semana 07
                  </span>
                </div>

                <div className="relative mt-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_30%_20%,#2a3320,#0d110c_70%)]">
                  <div className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(230,255,60,0.14)_12px,rgba(230,255,60,0.14)_13px)]" />
                  <div className="relative text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-acid/80">
                      Rasca aquí
                    </p>
                    <p className="mt-2 text-4xl">🎟️</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      4 asistencias · 46% top prize
                    </p>
                  </div>
                  <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-acid/40" />
                  <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-acid/40" />
                  <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-acid/40" />
                  <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-acid/40" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {PRIZE_LIST.map((prize, index) => (
                    <div
                      key={prize.id}
                      className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 text-[10.5px] leading-tight ${
                        prize.highValue
                          ? "border-acid/40 bg-acid/10 text-acid"
                          : "border-white/8 bg-white/[0.03] text-mist"
                      }`}
                    >
                      <span className="text-sm">{PRIZE_EMOJIS[index]}</span>
                      <span className="font-medium">{prize.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CITA / COMUNIDAD */}
        <section className="relative isolate overflow-hidden">
          <div className="relative min-h-[420px]">
            <Image
              src={IMAGES.community}
              alt="Entrenadores y socios del club"
              fill
              sizes="100vw"
              className="-z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-ink/70" />
            <div className="mx-auto flex min-h-[420px] w-full max-w-[1320px] flex-col justify-center px-5 py-16 sm:px-8">
              <span className="label-xs text-acid">Comunidad Stampa</span>
              <blockquote className="mt-4 max-w-3xl text-[clamp(1.4rem,3vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.02em]">
                “Llevo dos años viniendo cuatro días por semana. No he faltado ni un mes, y no es
                disciplina: es que aquí entrenar es lo mejor del día.”
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-acid text-sm font-bold text-ink">
                  AV
                </span>
                <div>
                  <p className="text-sm font-semibold">Aitana Vidal</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-fog">
                    Socia desde 2022 · plan mensual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="mx-auto w-full max-w-[1320px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <span className="label-xs text-acid">05 — Contacto</span>
              <h2 className="mt-3 text-[clamp(1.9rem,4.2vw,3.2rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                Pásate o
                <br />
                escríbenos.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-fog">
                Cuéntanos tu objetivo y te proponemos un plan realista. Si tienes una incidencia con
                tu acceso, WhatsApp es el camino más rápido.
              </p>

              <div className="mt-8 space-y-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-[16px] border border-acid/40 bg-acid/[0.07] px-4 py-4 transition-colors hover:bg-acid/[0.12]"
                >
                  <div>
                    <p className="label-xs text-acid">WhatsApp directo</p>
                    <p className="mt-1.5 text-base font-semibold text-white">{SITE.phoneDisplay}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-acid text-ink transition-transform group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.15c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.13.17 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29Z" />
                    </svg>
                  </span>
                </a>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[16px] border border-white/10 bg-graphite p-4">
                    <p className="label-xs text-fog">Dirección</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-mist">{SITE.address}</p>
                    <a
                      href={SITE.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-acid underline underline-offset-4"
                    >
                      Ver en el mapa
                    </a>
                  </div>
                  <div className="rounded-[16px] border border-white/10 bg-graphite p-4">
                    <p className="label-xs text-fog">Email</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="mt-2 block break-words text-[13px] leading-relaxed text-mist hover:text-acid"
                    >
                      {SITE.email}
                    </a>
                    <p className="mt-2 text-[11px] text-fog">Respuesta &lt; 24 h laborables</p>
                  </div>
                </div>

                <div className="rounded-[16px] border border-white/10 bg-graphite p-4">
                  <p className="label-xs text-fog">Horarios</p>
                  <ul className="mt-3 divide-y divide-white/8">
                    {SCHEDULE.map((row) => (
                      <li
                        key={row.day}
                        className="flex items-center justify-between gap-3 py-2 text-[12.5px]"
                      >
                        <span className="text-mist">{row.day}</span>
                        <span
                          className={
                            row.hours === "Cerrado · día de recovery"
                              ? "font-medium text-fog"
                              : "font-semibold text-white"
                          }
                        >
                          {row.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-graphite p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Cuéntanos</h3>
                  <p className="mt-1 text-xs text-fog">Te contestamos con opciones concretas.</p>
                </div>
                <span className="label-xs rounded-full border border-white/10 px-2.5 py-1 text-fog">
                  Form
                </span>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/8 px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto w-full max-w-[1320px]">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="label-xs text-acid">Dudas frecuentes</span>
                <h2 className="mt-3 text-[clamp(1.6rem,3.4vw,2.4rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]">
                  Antes de dar el paso
                </h2>
              </div>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-white marker:hidden">
                    {faq.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 text-acid transition-transform duration-300 group-open:rotate-45">
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl pr-10 text-sm leading-relaxed text-fog">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-5 pb-16 sm:px-8">
          <div className="relative mx-auto w-full max-w-[1320px] overflow-hidden rounded-[28px] bg-acid px-6 py-12 text-ink sm:px-12 sm:py-16">
            <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[26px] border-ink/10" />
            <span className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full border-[18px] border-ink/10" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="label-xs text-ink/60">Plazas limitadas por franja</span>
                <h2 className="mt-3 max-w-xl text-[clamp(1.9rem,4.4vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.035em]">
                  La constancia
                  <br />
                  se entrena hoy.
                </h2>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-graphite"
                >
                  Reservar sesión de bienvenida
                </a>
                <Link
                  href="/socios"
                  className="inline-flex items-center justify-center rounded-full border border-ink/30 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink/10"
                >
                  Entrar al portal
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-coal px-5 pb-24 pt-12 sm:px-8 sm:pb-12">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-fog">
                Club boutique de fuerza, funcional y wellness en el centro de Cochabamba. Entrena con criterio y
                disfruta del proceso.
              </p>
              <div className="mt-5 flex gap-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-mist hover:border-acid hover:text-acid"
                >
                  WhatsApp
                </a>
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-mist hover:border-acid hover:text-acid"
                >
                  Instagram
                </a>
              </div>
            </div>

            <div>
              <p className="label-xs text-fog">Club</p>
              <ul className="mt-4 space-y-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-[13px] text-mist hover:text-acid">
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link href="/socios" className="text-[13px] text-mist hover:text-acid">
                    Portal de socios
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="label-xs text-fog">Visítanos</p>
              <p className="mt-4 text-[13px] leading-relaxed text-mist">{SITE.address}</p>
              <p className="mt-2 text-[13px] text-mist">{SITE.phoneDisplay}</p>
              <p className="mt-1 break-words text-[13px] text-fog">{SITE.email}</p>
              <p className="mt-4 text-[10.5px] uppercase tracking-[0.1em] text-fog">
                L-V 06:00–22:00 · Sáb 08:00–13:00
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-[10.5px] uppercase tracking-[0.1em] text-fog sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {SITE.name}. Todos los derechos reservados.</p>
            <div className="flex flex-wrap gap-4">
              <span className="cursor-default">Aviso legal</span>
              <span className="cursor-default">Privacidad</span>
              <span className="cursor-default">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
