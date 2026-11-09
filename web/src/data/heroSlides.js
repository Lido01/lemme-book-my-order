/**
 * The hero's background images.
 *
 * High-definition photography with fallback to Unsplash barbershop collection.
 */

export const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=85",
    focus: "50% 40%",
  },
  {
    image: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=1920&q=85",
    focus: "50% 35%",
  },
  {
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1920&q=85",
    focus: "50% 45%",
  },
  {
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1920&q=85",
    focus: "50% 35%",
    dark: true,
  },
];

/** How long a slide holds before the next one fades in, in milliseconds. */
export const HERO_ROTATE_MS = 7000;

/** How long one crossfade takes. Short enough to feel like a dissolve. */
export const HERO_FADE_MS = 1400;
