import api, { API_ROOT } from "./api";
import { testimonials as fallbackTestimonials } from "../data/testimonials";

/**
 * Testimonials — /api/testimonials/testimonials/
 */

export async function listApprovedTestimonials({ signal } = {}) {
  if (!API_ROOT) {
    return fallbackTestimonials.map((t, idx) => ({
      id: idx + 1,
      customer_name: t.name,
      message: t.quote,
      rating: t.rating || 5,
      photo: null,
      status: "approved",
    }));
  }

  try {
    const response = await api.get("/testimonials/testimonials/", { signal });
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data
      : fallbackTestimonials.map((t, idx) => ({
          id: idx + 1,
          customer_name: t.name,
          message: t.quote,
          rating: t.rating || 5,
          photo: null,
          status: "approved",
        }));
  } catch (error) {
    return fallbackTestimonials.map((t, idx) => ({
      id: idx + 1,
      customer_name: t.name,
      message: t.quote,
      rating: t.rating || 5,
      photo: null,
      status: "approved",
    }));
  }
}

export function submitTestimonial(fields) {
  const formData = new FormData();
  formData.append("message", fields.message);
  formData.append("rating", fields.rating);

  if (fields.photo) {
    formData.append("photo", fields.photo);
  }

  if (!API_ROOT) {
    return Promise.resolve({
      id: Date.now(),
      message: fields.message,
      rating: fields.rating,
      status: "pending",
    });
  }

  return api
    .post("/testimonials/testimonials/", formData, {
      requiresAuth: true,
      authScope: "customer",
    })
    .then((response) => response.data)
    .catch(() => ({
      id: Date.now(),
      message: fields.message,
      rating: fields.rating,
      status: "pending",
    }));
}

export function listMyTestimonials({ signal } = {}) {
  if (!API_ROOT) return Promise.resolve([]);
  return api
    .get("/testimonials/testimonials/mine/", {
      requiresAuth: true,
      authScope: "customer",
      signal,
    })
    .then((response) => response.data)
    .catch(() => []);
}

export function listTestimonialsAdmin({ signal } = {}) {
  if (!API_ROOT) return Promise.resolve([]);
  return api
    .get("/testimonials/testimonials/", { requiresAuth: true, signal })
    .then((response) => response.data)
    .catch(() => []);
}

export const listAllTestimonials = listTestimonialsAdmin;

export function approveTestimonial(id) {
  if (!API_ROOT) return Promise.resolve({ status: "approved" });
  return api
    .post(`/testimonials/testimonials/${id}/approve/`, null, {
      requiresAuth: true,
    })
    .then((response) => response.data);
}

export function rejectTestimonial(id) {
  if (!API_ROOT) return Promise.resolve({ status: "rejected" });
  return api
    .post(`/testimonials/testimonials/${id}/reject/`, null, {
      requiresAuth: true,
    })
    .then((response) => response.data);
}

export function deleteTestimonial(id) {
  if (!API_ROOT) return Promise.resolve();
  return api
    .delete(`/testimonials/testimonials/${id}/`, { requiresAuth: true })
    .then(() => undefined);
}
