import api, { API_ROOT } from "./api";
import {
  createStandaloneBooking,
  getStandaloneAvailability,
  getStandaloneBarbers,
  getStandaloneBooking,
  lookupStandaloneBookings,
} from "./standaloneStore";

/**
 * Bookings API with dual mode:
 * 1. Connects to backend if configured (VITE_API_BASE_URL).
 * 2. Seamlessly falls back to local/cloud-ready storage if no backend is running.
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
    console.info("[bookingApi] Using standalone availability");
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

  if (!API_ROOT) {
    return createStandaloneBooking(payload);
  }

  try {
    const response = await api.post("/bookings/", payload);
    return response.data;
  } catch (error) {
    console.info("[bookingApi] Fallback to standalone booking creation");
    return createStandaloneBooking(payload);
  }
}

export async function listBarbers({ signal } = {}) {
  if (!API_ROOT) {
    return getStandaloneBarbers();
  }

  try {
    const response = await api.get("/barbers/", { signal });
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data
      : getStandaloneBarbers();
  } catch (error) {
    console.info("[bookingApi] Using standalone barbers");
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
  return api
    .post(`/bookings/${id}/cancel/`, null, { requiresAuth: true })
    .then((response) => response.data);
}

export function confirmBooking(id) {
  return api
    .post(`/bookings/${id}/confirm/`, null, { requiresAuth: true })
    .then((response) => response.data);
}

export function completeBooking(id) {
  return api
    .post(`/bookings/${id}/complete/`, null, { requiresAuth: true })
    .then((response) => response.data);
}

export function deleteBooking(id) {
  return api
    .delete(`/bookings/${id}/`, { requiresAuth: true })
    .then(() => undefined);
}
