/**
 * Standalone Client Storage & Cloud-Ready Store for NOIR Barbers
 * 
 * Works completely independently without requiring a Python backend.
 * Stores bookings, payments, and preferences in localStorage.
 * Provides fallback services, barbers, and live availability schedules.
 * Ready to connect with free cloud databases (Supabase, Firebase, etc.).
 */

import { haircuts } from "../data/haircuts";
import { barbers as defaultBarbersData } from "../data/barbers";

const STORAGE_KEYS = {
  BOOKINGS: "noir.cloud.bookings",
  PAYMENTS: "noir.cloud.payments",
  SERVICES: "noir.cloud.services",
  SETTINGS: "noir.cloud.settings",
};

/**
 * Initial catalogue of services populated from haircut styling data
 */
export const INITIAL_SERVICES = [
  {
    id: 1,
    name: "Low Fade Haircut",
    description: "A clean, low transition that keeps the sides refined and the top natural. Finished with hot-towel detailing.",
    price: "350.00",
    duration: 40,
    is_active: true,
    image: haircuts[0]?.image || "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 101, name: "Taper Low Fade" },
      { id: 102, name: "Drop Low Fade" },
      { id: 103, name: "Natural Texture Top" },
    ],
  },
  {
    id: 2,
    name: "Mid Fade Haircut",
    description: "A balanced, modern fade with a stronger transition and sharp silhouette. Versatile for curls and waves.",
    price: "400.00",
    duration: 45,
    is_active: true,
    image: haircuts[1]?.image || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 201, name: "Mid Skin Blend" },
      { id: 202, name: "Textured Crop Mid" },
    ],
  },
  {
    id: 3,
    name: "Skin Fade Cut",
    description: "Ultra-clean sides that melt straight into the skin for maximum definition and contrast.",
    price: "450.00",
    duration: 50,
    is_active: true,
    image: haircuts[2]?.image || "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 301, name: "High Skin Fade" },
      { id: 302, name: "Bald Fade Lineup" },
    ],
  },
  {
    id: 4,
    name: "Textured Crop",
    description: "Controlled texture on top with a contemporary, easy-to-style matte finish.",
    price: "400.00",
    duration: 45,
    is_active: true,
    image: haircuts[3]?.image || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 401, name: "French Crop" },
      { id: 402, name: "Messy Texture Top" },
    ],
  },
  {
    id: 5,
    name: "Classic Gentleman's Cut",
    description: "Traditional barbering with tailored proportions, natural taper, and hot-towel neck shave.",
    price: "300.00",
    duration: 35,
    is_active: true,
    image: haircuts[4]?.image || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 501, name: "Classic Side Part" },
      { id: 502, name: "Slick Back Taper" },
    ],
  },
  {
    id: 6,
    name: "Beard Sculpt & Razor Shape",
    description: "Precise beard sculpting tailored to jawline with hot towel, oil treatment, and razor lineup.",
    price: "250.00",
    duration: 30,
    is_active: true,
    image: haircuts[5]?.image || "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 601, name: "Sharp Contour Lineup" },
      { id: 602, name: "Natural Fade Beard" },
    ],
  },
  {
    id: 7,
    name: "Full Grooming: Cut + Beard",
    description: "Our signature combo: full custom haircut of your choice combined with luxury beard sculpting and hot-towel treatment.",
    price: "600.00",
    duration: 65,
    is_active: true,
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85",
    styles: [
      { id: 701, name: "Fade + Sharp Beard" },
      { id: 702, name: "Textured Crop + Stubble" },
    ],
  },
];

/**
 * Initial list of barbers with active status
 */
export const INITIAL_BARBERS = defaultBarbersData.map((b) => ({
  ...b,
  is_active: true,
  bio: `${b.role} specializing in ${b.specialty}`,
}));

// Helper to safely read localStorage
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Helper to safely write localStorage
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[standaloneStore] Unable to write to ${key}:`, err);
  }
}

/**
 * Get all available services
 */
export function getStandaloneServices() {
  const custom = loadFromStorage(STORAGE_KEYS.SERVICES, null);
  return custom || INITIAL_SERVICES;
}

/**
 * Get all active barbers
 */
export function getStandaloneBarbers() {
  return INITIAL_BARBERS;
}

/**
 * Calculate available booking slots for a given date
 */
export function getStandaloneAvailability({ serviceId, bookingDate, barberId }) {
  const service = getStandaloneServices().find((s) => String(s.id) === String(serviceId));
  const barber = barberId
    ? INITIAL_BARBERS.find((b) => String(b.id) === String(barberId))
    : INITIAL_BARBERS[0];

  // Base shop hours: 09:00 to 20:00 in 45-min / 60-min intervals
  const baseSlots = [
    "09:00:00",
    "09:45:00",
    "10:30:00",
    "11:15:00",
    "12:00:00",
    "14:00:00",
    "14:45:00",
    "15:30:00",
    "16:15:00",
    "17:00:00",
    "17:45:00",
    "18:30:00",
    "19:15:00",
  ];

  // Filter out slots already booked in storage
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const bookedForDate = new Set(
    bookings
      .filter((b) => b.booking_date === bookingDate && (!barberId || String(b.barber) === String(barberId)))
      .map((b) => b.start_time)
  );

  // Check if slot has already passed for today
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const available_times = baseSlots.filter((slot) => {
    if (bookedForDate.has(slot)) return false;
    if (bookingDate === todayStr) {
      const [h, m] = slot.split(":").map(Number);
      if (h * 60 + m <= currentMinutes + 15) return false;
    }
    return true;
  });

  return {
    service: serviceId,
    date: bookingDate,
    barber: barberId || barber?.id || 1,
    barber_name: barber?.name || "Any Barber",
    available_times,
    availability: {
      status: available_times.length > 0 ? "available" : "fully_booked",
      message:
        available_times.length > 0
          ? `${available_times.length} chairs open on this date`
          : "Fully booked for selected date",
      window: "09:00 AM – 08:00 PM",
      next_available: null,
    },
  };
}

/**
 * Create a new booking in standalone storage
 */
export function createStandaloneBooking(payload) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const services = getStandaloneServices();
  const service = services.find((s) => String(s.id) === String(payload.service)) || services[0];
  const barber = payload.barber
    ? INITIAL_BARBERS.find((b) => String(b.id) === String(payload.barber))
    : INITIAL_BARBERS[0];

  const nextNum = (bookings.length + 1).toString().padStart(4, "0");
  const code = `BK-${nextNum}`;
  const id = Date.now();

  const newBooking = {
    id,
    booking_code: code,
    customer_name: payload.customer_name || "Guest Customer",
    customer_phone: payload.customer_phone || "",
    service: service?.id || 1,
    service_name: service?.name || "Barbering Service",
    barber: barber?.id || 1,
    barber_name: barber?.name || "Barber",
    booking_date: payload.booking_date,
    start_time: payload.start_time,
    end_time: payload.start_time,
    status: "confirmed",
    notes: payload.notes || "",
    price: service?.price || "350.00",
    payment_status: "pending",
    payment_due: true,
    payment_open: true,
    already_booked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  bookings.unshift(newBooking);
  saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);

  return newBooking;
}

/**
 * Get booking by ID or Code
 */
export function getStandaloneBooking(idOrCode) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  return bookings.find(
    (b) => String(b.id) === String(idOrCode) || b.booking_code === idOrCode
  ) || null;
}

/**
 * Look up bookings by code and phone
 */
export function lookupStandaloneBookings({ code, phone }) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  return bookings.filter((b) => {
    const matchCode = !code || b.booking_code?.toLowerCase() === code.trim().toLowerCase();
    const matchPhone = !phone || b.customer_phone?.replace(/\D/g, "").endsWith(phone.replace(/\D/g, "").slice(-8));
    return matchCode && matchPhone;
  });
}

/**
 * Record a payment for a booking
 */
export function createStandalonePayment(data) {
  const payments = loadFromStorage(STORAGE_KEYS.PAYMENTS, []);
  const booking = getStandaloneBooking(data.bookingId);

  const paymentRecord = {
    id: Date.now(),
    booking: data.bookingId,
    booking_code: booking?.booking_code || data.bookingCode || "BK-0001",
    booking_status: "confirmed",
    booking_date: booking?.booking_date || new Date().toISOString().slice(0, 10),
    booking_start_time: booking?.start_time || "10:00:00",
    booking_barber: booking?.barber_name || "Lidetu",
    booking_customer: booking?.customer_name || "Customer",
    booking_service: booking?.service_name || "Haircut",
    amount: data.amount || booking?.price || "350.00",
    method: data.method || "telebirr",
    transaction_reference: data.transactionReference || `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
    receipt: null,
    status: "verified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  payments.unshift(paymentRecord);
  saveToStorage(STORAGE_KEYS.PAYMENTS, payments);

  // Update booking payment status
  if (booking) {
    booking.payment_status = "verified";
    booking.payment_due = false;
    booking.payment_open = false;
    const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
    const idx = bookings.findIndex((b) => String(b.id) === String(booking.id));
    if (idx !== -1) {
      bookings[idx] = booking;
      saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    }
  }

  return paymentRecord;
}
