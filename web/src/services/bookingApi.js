import api, { API_ROOT } from "./api";
import {
  createStandaloneBooking,
  getStandaloneAvailability,
  getStandaloneBarbers,
  getStandaloneBooking,
  lookupStandaloneBookings,
  updateStandaloneBookingStatus,
} from "./standaloneStore";
import {
  isSupabaseConfigured,
  fetchSupabaseBarbers,
  insertSupabaseBooking,
  updateSupabaseBookingStatus as updateSupabaseBooking,
} from "./supabase";

/**
 * Bookings API:
 * 1. Synchronizes with Supabase Cloud Database when configured.
 * 2. Uses Django backend API if configured.
 * 3. Falls back gracefully to local client storage.
 */

export async function getAvailability(
  { serviceId, bookingDate, barberId },
  { signal } = {}
) {
  if (!API_ROOT) {
    return getStandaloneAvailability({ serviceId, bookingDate, barberId });
  }

  const params = {
    service: serviceId,
    booking_date: bookingDate,
  };

  if (barberId) {
    params.barber = barberId;
  }

  try {
    const response = await api.get("/bookings/availability/", { params, signal });
    return response.data;
  } catch (error) {
    return getStandaloneAvailability({ serviceId, bookingDate, barberId });
  }
}

export async function createBooking({
  customerName,
  customerPhone,
  serviceId,
  barberId,
  bookingDate,
  startTime,
  notes,
}) {
  const payload = {
    customer_name: customerName,
    customer_phone: customerPhone,
    service: serviceId,
    booking_date: bookingDate,
    start_time: startTime,
  };

  if (barberId) {
    payload.barber = barberId;
  }

  if (notes) {
    payload.notes = notes;
  }

  let bookingResult = null;

  if (!API_ROOT) {
    bookingResult = createStandaloneBooking(payload);
  } else {
    try {
      const response = await api.post("/bookings/", payload);
      bookingResult = response.data;
    } catch (error) {
      bookingResult = createStandaloneBooking(payload);
    }
  }

  // Push to Supabase Cloud Database if configured
  if (isSupabaseConfigured() && bookingResult) {
    insertSupabaseBooking({
      booking_code: bookingResult.booking_code,
      customer_name: bookingResult.customer_name,
      customer_phone: bookingResult.customer_phone,
      service_id: bookingResult.service,
      service_name: bookingResult.service_name,
      barber_id: bookingResult.barber,
      barber_name: bookingResult.barber_name,
      booking_date: bookingResult.booking_date,
      start_time: bookingResult.start_time,
      status: bookingResult.status,
      price: bookingResult.price,
      payment_status: bookingResult.payment_status,
      notes: bookingResult.notes,
    }).catch((err) => console.warn("[bookingApi] Supabase insert error:", err));
  }

  return bookingResult;
}

export async function listBarbers({ signal } = {}) {
  if (isSupabaseConfigured()) {
    try {
      const supaBarbers = await fetchSupabaseBarbers();
      if (Array.isArray(supaBarbers) && supaBarbers.length > 0) {
        return supaBarbers;
      }
    } catch {}
  }

  if (!API_ROOT) {
    return getStandaloneBarbers();
  }

  try {
    const response = await api.get("/barbers/", { signal });
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data
      : getStandaloneBarbers();
  } catch (error) {
    return getStandaloneBarbers();
  }
}

export async function lookupBooking({ code, phone }) {
  if (!API_ROOT) {
    const found = lookupStandaloneBookings({ code, phone });
    const target = found[0] || null;
    return {
      booking: target,
      payment: null,
      payment_due: target ? target.payment_due : false,
      payment_open: target ? target.payment_open : false,
      payment_rejected: false,
      other_bookings: found.slice(1),
    };
  }

  try {
    const response = await api.post("/bookings/lookup/", { code, phone });
    return response.data;
  } catch (error) {
    const found = lookupStandaloneBookings({ code, phone });
    const target = found[0] || null;
    return {
      booking: target,
      payment: null,
      payment_due: target ? target.payment_due : false,
      payment_open: target ? target.payment_open : false,
      payment_rejected: false,
      other_bookings: found.slice(1),
    };
  }
}

export async function getBookingStatus(
  bookingId,
  { signal, bookingCode, bookingPhone } = {}
) {
  if (!API_ROOT) {
    const booking = getStandaloneBooking(bookingId) || getStandaloneBooking(bookingCode);
    return {
      booking,
      payment: null,
      payment_due: booking?.payment_due ?? true,
      payment_open: booking?.payment_open ?? true,
      payment_rejected: false,
    };
  }

  try {
    const response = await api.get(`/bookings/${bookingId}/status/`, {
      signal,
      headers: {
        "X-Booking-Code": bookingCode,
        "X-Booking-Phone": bookingPhone,
      },
    });
    return response.data;
  } catch (error) {
    const booking = getStandaloneBooking(bookingId) || getStandaloneBooking(bookingCode);
    return {
      booking,
      payment: null,
      payment_due: booking?.payment_due ?? true,
      payment_open: booking?.payment_open ?? true,
      payment_rejected: false,
    };
  }
}

export async function listMyBookings({ signal } = {}) {
  if (!API_ROOT) {
    return lookupStandaloneBookings({});
  }

  try {
    const response = await api.get("/bookings/mine/", {
      requiresAuth: true,
      authScope: "customer",
      signal,
    });
    return response.data;
  } catch (error) {
    return lookupStandaloneBookings({});
  }
}

// --- admin only ---------------------------------------------------

export function listBookings({ signal } = {}) {
  if (!API_ROOT) {
    return Promise.resolve(lookupStandaloneBookings({}));
  }
  return api
    .get("/bookings/", { requiresAuth: true, signal })
    .then((response) => response.data)
    .catch(() => lookupStandaloneBookings({}));
}

export function getBooking(id, { signal } = {}) {
  if (!API_ROOT) {
    return Promise.resolve(getStandaloneBooking(id));
  }
  return api
    .get(`/bookings/${id}/`, { requiresAuth: true, signal })
    .then((response) => response.data)
    .catch(() => getStandaloneBooking(id));
}

export function cancelBooking(id) {
  if (isSupabaseConfigured()) {
    updateSupabaseBooking(id, "cancelled").catch(() => {});
  }
  if (!API_ROOT) {
    return Promise.resolve(updateStandaloneBookingStatus(id, "cancelled"));
  }
  return api
    .post(`/bookings/${id}/cancel/`, null, { requiresAuth: true })
    .then((response) => response.data)
    .catch(() => updateStandaloneBookingStatus(id, "cancelled"));
}

export function confirmBooking(id) {
  if (isSupabaseConfigured()) {
    updateSupabaseBooking(id, "confirmed").catch(() => {});
  }
  if (!API_ROOT) {
    return Promise.resolve(updateStandaloneBookingStatus(id, "confirmed"));
  }
  return api
    .post(`/bookings/${id}/confirm/`, null, { requiresAuth: true })
    .then((response) => response.data)
    .catch(() => updateStandaloneBookingStatus(id, "confirmed"));
}

export function completeBooking(id) {
  if (isSupabaseConfigured()) {
    updateSupabaseBooking(id, "completed").catch(() => {});
  }
  if (!API_ROOT) {
    return Promise.resolve(updateStandaloneBookingStatus(id, "completed"));
  }
  return api
    .post(`/bookings/${id}/complete/`, null, { requiresAuth: true })
    .then((response) => response.data)
    .catch(() => updateStandaloneBookingStatus(id, "completed"));
}

export function deleteBooking(id) {
  return api
    .delete(`/bookings/${id}/`, { requiresAuth: true })
    .then(() => undefined);
}
