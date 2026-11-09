/**
 * Standalone Client Storage & Cloud-Ready Store for NOIR Barbers
 * 
 * Works completely independently without requiring a Python backend.
 * Stores bookings, payments, services, barbers, and gallery assets in localStorage.
 * Provides fallback services, barbers, and live availability schedules.
 * Ready to connect with free cloud databases (Supabase, Firebase, etc.).
 */

import { haircuts } from "../data/haircuts";
import { barbers as defaultBarbersData } from "../data/barbers";

const STORAGE_KEYS = {
  BOOKINGS: "noir.cloud.bookings",
  PAYMENTS: "noir.cloud.payments",
  SERVICES: "noir.cloud.services",
  BARBERS: "noir.cloud.barbers",
  GALLERY: "noir.cloud.gallery",
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

export const INITIAL_GALLERY = haircuts.map((h, i) => ({
  id: i + 1,
  title: h.name,
  description: h.description,
  style_name: h.name,
  is_active: true,
  image: h.image,
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

// ------------------------------------------------------------------
// SERVICES ASSET CRUD
// ------------------------------------------------------------------

export function getStandaloneServices() {
  const custom = loadFromStorage(STORAGE_KEYS.SERVICES, null);
  return custom || INITIAL_SERVICES;
}

export function saveStandaloneService(serviceData) {
  const services = [...getStandaloneServices()];
  const id = serviceData.id ? Number(serviceData.id) : Date.now();
  const existingIdx = services.findIndex((s) => Number(s.id) === id);

  const updated = {
    id,
    name: serviceData.name || "Custom Haircut",
    description: serviceData.description || "",
    price: String(serviceData.price || "350.00"),
    duration: Number(serviceData.duration || 45),
    is_active: serviceData.is_active !== false,
    image: serviceData.image || haircuts[0]?.image,
    styles: serviceData.styles || [],
  };

  if (existingIdx !== -1) {
    services[existingIdx] = { ...services[existingIdx], ...updated };
  } else {
    services.unshift(updated);
  }

  saveToStorage(STORAGE_KEYS.SERVICES, services);
  return updated;
}

export function deleteStandaloneService(id) {
  const services = getStandaloneServices().filter((s) => Number(s.id) !== Number(id));
  saveToStorage(STORAGE_KEYS.SERVICES, services);
  return true;
}

// ------------------------------------------------------------------
// BARBERS ASSET CRUD
// ------------------------------------------------------------------

export function getStandaloneBarbers() {
  const custom = loadFromStorage(STORAGE_KEYS.BARBERS, null);
  return custom || INITIAL_BARBERS;
}

export function saveStandaloneBarber(barberData) {
  const barbers = [...getStandaloneBarbers()];
  const id = barberData.id ? Number(barberData.id) : Date.now();
  const existingIdx = barbers.findIndex((b) => Number(b.id) === id);

  const updated = {
    id,
    name: barberData.name || "New Barber",
    role: barberData.role || "Barber",
    specialty: barberData.specialty || "Precision Fades & Styling",
    image: barberData.image || "/images/barbers/daniel.webp",
    is_active: barberData.is_active !== false,
    bio: barberData.bio || `${barberData.role || "Barber"} at NOIR`,
  };

  if (existingIdx !== -1) {
    barbers[existingIdx] = { ...barbers[existingIdx], ...updated };
  } else {
    barbers.push(updated);
  }

  saveToStorage(STORAGE_KEYS.BARBERS, barbers);
  return updated;
}

export function deleteStandaloneBarber(id) {
  const barbers = getStandaloneBarbers().filter((b) => Number(b.id) !== Number(id));
  saveToStorage(STORAGE_KEYS.BARBERS, barbers);
  return true;
}

// ------------------------------------------------------------------
// GALLERY ASSET CRUD
// ------------------------------------------------------------------

export function getStandaloneGallery() {
  const custom = loadFromStorage(STORAGE_KEYS.GALLERY, null);
  return custom || INITIAL_GALLERY;
}

export function saveStandaloneGallery(itemData) {
  const items = [...getStandaloneGallery()];
  const id = itemData.id ? Number(itemData.id) : Date.now();
  const existingIdx = items.findIndex((i) => Number(i.id) === id);

  const updated = {
    id,
    title: itemData.title || "Studio Style",
    description: itemData.description || "",
    style_name: itemData.style_name || itemData.title || "Custom Cut",
    is_active: itemData.is_active !== false,
    image: itemData.image || haircuts[0]?.image,
  };

  if (existingIdx !== -1) {
    items[existingIdx] = { ...items[existingIdx], ...updated };
  } else {
    items.unshift(updated);
  }

  saveToStorage(STORAGE_KEYS.GALLERY, items);
  return updated;
}

export function deleteStandaloneGallery(id) {
  const items = getStandaloneGallery().filter((i) => Number(i.id) !== Number(id));
  saveToStorage(STORAGE_KEYS.GALLERY, items);
  return true;
}

// ------------------------------------------------------------------
// AVAILABILITY & BOOKINGS
// ------------------------------------------------------------------

export function getStandaloneAvailability({ serviceId, bookingDate, barberId }) {
  const barber = barberId
    ? getStandaloneBarbers().find((b) => String(b.id) === String(barberId))
    : getStandaloneBarbers()[0];

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

  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const bookedForDate = new Set(
    bookings
      .filter((b) => b.booking_date === bookingDate && (!barberId || String(b.barber) === String(barberId)))
      .map((b) => b.start_time)
  );

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

export function createStandaloneBooking(payload) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const services = getStandaloneServices();
  const service = services.find((s) => String(s.id) === String(payload.service)) || services[0];
  const barbers = getStandaloneBarbers();
  const barber = payload.barber
    ? barbers.find((b) => String(b.id) === String(payload.barber))
    : barbers[0];

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

export function getStandaloneBookings() {
  return loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
}

export function deleteStandaloneBooking(id) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const updated = bookings.filter((b) => String(b.id) !== String(id));
  saveToStorage(STORAGE_KEYS.BOOKINGS, updated);
  return true;
}

export function getStandaloneBooking(idOrCode) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  return bookings.find(
    (b) => String(b.id) === String(idOrCode) || b.booking_code === idOrCode
  ) || null;
}

export function updateStandaloneBookingStatus(id, newStatus) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const idx = bookings.findIndex((b) => String(b.id) === String(id));
  if (idx !== -1) {
    bookings[idx].status = newStatus;
    bookings[idx].updated_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[idx];
  }
  return null;
}

export function lookupStandaloneBookings({ code, phone }) {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  return bookings.filter((b) => {
    const matchCode = !code || b.booking_code?.toLowerCase() === code.trim().toLowerCase();
    const matchPhone = !phone || b.customer_phone?.replace(/\D/g, "").endsWith(phone.replace(/\D/g, "").slice(-8));
    return matchCode && matchPhone;
  });
}

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
    booking_barber: booking?.barber_name || "Barber",
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

// ------------------------------------------------------------------
// DASHBOARD AGGREGATE STATS
// ------------------------------------------------------------------

export function getStandaloneDashboard() {
  const bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, []);
  const payments = loadFromStorage(STORAGE_KEYS.PAYMENTS, []);
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayBookings = bookings.filter((b) => b.booking_date === todayStr);
  const upcomingBookings = bookings.filter((b) => b.booking_date > todayStr);

  const todayRevenue = todayBookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
  const monthRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

  return {
    queues: {
      bookings_to_confirm: bookings.filter((b) => b.status === "pending").length,
      payments_to_verify: payments.filter((p) => p.status === "pending").length,
      payments_outstanding: bookings.filter((b) => b.status === "confirmed" && b.payment_status !== "verified").length,
      reviews_to_approve: 0,
    },
    counts: {
      bookings: {
        today: todayBookings.length,
        upcoming: upcomingBookings.length,
        completed_today: todayBookings.filter((b) => b.status === "completed").length,
      },
      revenue: {
        today: todayRevenue.toFixed(2),
        month: monthRevenue.toFixed(2),
      },
    },
    schedules: {
      today: todayBookings,
      upcoming: upcomingBookings.slice(0, 6),
    },
  };
}
