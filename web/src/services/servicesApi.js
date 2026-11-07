import api, { API_ROOT } from "./api";
import { getStandaloneServices } from "./standaloneStore";

/**
 * Services — GET /api/services/
 *
 * Supports both full backend API and standalone/cloud-ready client operation.
 * If backend is not running, falls back automatically to local catalogue.
 */

export async function listServices({ signal } = {}) {
  if (!API_ROOT) {
    return getStandaloneServices();
  }
  try {
    const response = await api.get("/services/", { signal });
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data
      : getStandaloneServices();
  } catch (error) {
    console.info("[servicesApi] Operating in standalone/cloud-ready fallback");
    return getStandaloneServices();
  }
}

export async function getService(id, { signal } = {}) {
  if (!API_ROOT) {
    return (
      getStandaloneServices().find((s) => String(s.id) === String(id)) || null
    );
  }
  try {
    const response = await api.get(`/services/${id}/`, { signal });
    return response.data;
  } catch (error) {
    return (
      getStandaloneServices().find((s) => String(s.id) === String(id)) || null
    );
  }
}

// --- admin only ---------------------------------------------------

export function listAllServices({ signal } = {}) {
  if (!API_ROOT) {
    return Promise.resolve(getStandaloneServices());
  }
  return api
    .get("/services/", { requiresAuth: true, signal })
    .then((response) => response.data)
    .catch(() => getStandaloneServices());
}

export function createService(fields) {
  const formData = new FormData();

  if (fields.name) formData.append("name", fields.name);
  if (fields.description) formData.append("description", fields.description);
  if (fields.price !== undefined) formData.append("price", fields.price);
  if (fields.duration !== undefined) {
    formData.append("duration", fields.duration);
  }
  if (fields.image) formData.append("image", fields.image);

  return api
    .post("/services/", formData, { requiresAuth: true })
    .then((response) => response.data);
}

export function updateService(id, fields) {
  const formData = new FormData();

  if (fields.name !== undefined) formData.append("name", fields.name);
  if (fields.description !== undefined) {
    formData.append("description", fields.description);
  }
  if (fields.price !== undefined) formData.append("price", fields.price);
  if (fields.duration !== undefined) {
    formData.append("duration", fields.duration);
  }
  if (fields.image) formData.append("image", fields.image);

  return api
    .patch(`/services/${id}/`, formData, { requiresAuth: true })
    .then((response) => response.data);
}

export function deleteService(id) {
  return api
    .delete(`/services/${id}/`, { requiresAuth: true })
    .then(() => undefined);
}

export function createHaircutStyle(serviceId, fields) {
  const formData = new FormData();

  if (fields.name) formData.append("name", fields.name);
  if (fields.description) formData.append("description", fields.description);
  if (fields.image) formData.append("image", fields.image);

  return api
    .post(`/services/${serviceId}/styles/create/`, formData, {
      requiresAuth: true,
    })
    .then((response) => response.data);
}

export function deleteHaircutStyle(serviceId, styleId) {
  return api
    .delete(`/services/${serviceId}/styles/${styleId}/`, {
      requiresAuth: true,
    })
    .then(() => undefined);
}
