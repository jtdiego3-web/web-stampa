export const SITE = {
  name: "Stampa Wellness Gym",
  claim: "Entrena sin ruido. Vive sin límites.",
  phoneDisplay: "+591 75985568",
  whatsappNumber: "59175985568",
  whatsappMessage:
    "Hola Stampa Wellness Gym 👋 Me gustaría resolver unas dudas antes de empezar.",
  email: "hola@stampagym.com",
  address: "Planta Baja, Plaza Colón, Edificio Venus, Mayor Rocha 433, Cochabamba, Bolivia",
  instagram: "https://instagram.com",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Edificio+Venus+Mayor+Rocha+433+Cochabamba+Bolivia",
} as const;

export const whatsappLink = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  SITE.whatsappMessage,
)}`;

export const NAV_LINKS = [
  { label: "Instalaciones", href: "#instalaciones" },
  { label: "Entrenadores", href: "#entrenadores" },
  { label: "Contacto", href: "#contacto" },
] as const;

export const IMAGES = {
  hero: "https://images.pexels.com/photos/36877065/pexels-photo-36877065.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=2000",
  heroSecondary:
    "https://images.pexels.com/photos/17211446/pexels-photo-17211446.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
  strength:
    "https://images.pexels.com/photos/19132573/pexels-photo-19132573.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
  functional:
    "https://images.pexels.com/photos/30191517/pexels-photo-30191517.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
  cardio:
    "https://images.pexels.com/photos/6739958/pexels-photo-6739958.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
  wellness:
    "https://images.pexels.com/photos/6389893/pexels-photo-6389893.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
  community:
    "https://images.pexels.com/photos/13451904/pexels-photo-13451904.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
} as const;

export const TRAINERS = [
  {
    name: "Ivar López",
    role: "Entrenador · Musculación",
    bio: "Especialista en fuerza e hipertrofia. Te enseña la técnica correcta en máquinas Technogym y peso libre.",
    tags: ["Musculación", "Hipertrofia"],
    image:
      "https://images.pexels.com/photos/3912944/pexels-photo-3912944.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=800",
  },
  {
    name: "Ernesto Mejía",
    role: "Entrenador · Fuerza y peso libre",
    bio: "Rutinas de fuerza con mancuernas de hasta 100 lbs, progresión de cargas y acondicionamiento.",
    tags: ["Fuerza", "Peso libre"],
    image:
      "https://images.pexels.com/photos/21633393/pexels-photo-21633393.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=800",
  },
  {
    name: "Francisco Terán",
    role: "Entrenador · Cardio y acondicionamiento",
    bio: "Planes de cardio para quemar grasa, mejorar resistencia y complementar tu musculación.",
    tags: ["Cardio", "Resistencia"],
    image:
      "https://images.pexels.com/photos/31918891/pexels-photo-31918891.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=800",
  },
] as const;

export const FACILITIES = [
  {
    title: "Musculación · Technogym",
    copy: "Sala de máquinas Technogym y Pure Strength para trabajar cada grupo muscular con precisión.",
    meta: "Sala 1",
    image: IMAGES.strength,
  },
  {
    title: "Musculación · Mancuernas",
    copy: "Sala de peso libre con mancuernas Ivanko hasta 100 lbs, bancos y racks.",
    meta: "Hasta 100 lbs",
    image: IMAGES.functional,
  },
  {
    title: "Sala de cardio",
    copy: "Cintas, elípticas y bicicletas para tus sesiones de resistencia y quema de grasa.",
    meta: "Cardio",
    image: IMAGES.cardio,
  },
] as const;

export const SCHEDULE = [
  { day: "Lunes a viernes", hours: "06:00 — 22:00" },
  { day: "Sábado", hours: "08:00 — 13:00" },
  { day: "Domingo", hours: "Cerrado · día de recovery" },
] as const;

export const FAQS = [
  {
    q: "¿Cómo funciona el plan de 26 sesiones?",
    a: "El plan Mensual incluye 26 entrenamientos al mes con acceso libre a sala, clases y wellness. El club abre 6 días a la semana, así que puedes entrenar prácticamente cada día.",
  },
  {
    q: "¿Qué es el Rasca y Gana de socios?",
    a: "Cada semana que registres al menos una asistencia podrás rascar una casilla desde tu portal. Cuantos más días entrenes en la semana, más probabilidades de ganar descuentos del 10% o 20% para tu renovación.",
  },
  {
    q: "¿Necesito cita para la primera visita?",
    a: "No. Escríbenos por WhatsApp y te reservamos una sesión de bienvenida con uno de nuestros entrenadores, sin compromiso.",
  },
] as const;
