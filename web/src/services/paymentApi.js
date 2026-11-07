import api, { API_ROOT } from "./api";
import { createStandalonePayment } from "./standaloneStore";

/**
 * Payments — /api/payments/payments/
 * Supports both Django backend API and client standalone fallback.
 */

export const PAYMENT_METHODS = [
  { value: "telebirr", label: "Telebirr" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cbe", label: "CBE" },
  { value: "other", label: "Other" },
];

/**
 * Submit a payment for a booking.
 */
export async function createPayment(
  {
    bookingId,
    bookingCode,
    bookingPhone,
    amount,
    method,
    transactionReference,
    receiptFile,
  },
  { onProgress } = {}
) {
  if (!API_ROOT) {
    if (onProgress) onProgress(100);
    return createStandalonePayment({
      bookingId,
      bookingCode,
      bookingPhone,
      amount,
      method,
      transactionReference,
      receiptFile,
    });
  }

  const formData = new FormData();

  formData.append("booking", bookingId);
  formData.append("booking_reference", bookingCode || "");
  formData.append("booking_phone", bookingPhone || "");
  formData.append("amount", amount);
  formData.append("method", method);

  if (transactionReference) {
    formData.append("transaction_reference", transactionReference);
  }

  if (receiptFile) {
    formData.append("receipt", receiptFile);
  }

  try {
    const response = await api.post("/payments/payments/", formData, {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return;
        }
        onProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return response.data;
  } catch (error) {
    console.info("[paymentApi] Fallback to standalone payment verification");
    return createStandalonePayment({
      bookingId,
      bookingCode,
      bookingPhone,
      amount,
      method,
      transactionReference,
      receiptFile,
    });
  }
}

export function getPayment(id, { signal } = {}) {
  if (!API_ROOT) {
    return Promise.resolve(null);
  }
  return api
    .get(`/payments/payments/${id}/`, { signal })
    .then((response) => response.data)
    .catch(() => null);
}

// --- staff only ---------------------------------------------------

export function listPayments({ signal } = {}) {
  if (!API_ROOT) {
    return Promise.resolve([]);
  }
  return api
    .get("/payments/payments/", { requiresAuth: true, signal })
    .then((response) => response.data)
    .catch(() => []);
}

export function verifyPayment(id) {
  if (!API_ROOT) {
    return Promise.resolve({ status: "verified" });
  }
  return api
    .post(`/payments/payments/${id}/verify/`, null, { requiresAuth: true })
    .then((response) => response.data);
}

export function rejectPayment(id, reason) {
  if (!API_ROOT) {
    return Promise.resolve({ status: "rejected", reason });
  }
  return api
    .post(`/payments/payments/${id}/reject/`, { reason }, { requiresAuth: true })
    .then((response) => response.data);
}
