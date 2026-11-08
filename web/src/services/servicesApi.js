import api, { API_ROOT } from "./api";
import {
  deleteStandaloneService,
  getStandaloneServices,
  saveStandaloneService,
} from "./standaloneStore";

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

export async function createService(fields) {
  if (!API_ROOT) {
    return saveStandaloneService(fields);
  }
  const formData = new FormData();

  if (fields.name) formData.append("name", fields.name);
  if (fields.description) formData.append("description", fields.description);
  if (fields.price !== undefined) formData.append("price", fields.price);
  if (fields.duration !== undefined) {
    formData.append("duration", fields.duration);
  }
  if (fields.image) formData.append("image", fields.image);

  try {
    const response = await api.post("/services/", formData, { requiresAuth: true });
    return response.data;
  } catch {
    return saveStandaloneService(fields);
  }
}

export async function updateService(id, fields) {
  if (!API_ROOT) {
    return saveStandaloneService({ ...fields, id });
  }
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

  try {
    const response = await api.patch(`/services/${id}/`, formData, { requiresAuth: true });
    return response.data;
  } catch {
    return saveStandaloneService({ ...fields, id });
  }
}

export async function deleteService(id) {
  if (!API_ROOT) {
    return deleteStandaloneService(id);
  }
  try {
    await api.delete(`/services/${id}/`, { requiresAuth: true });
    return undefined;
  } catch {
    return deleteStandaloneService(id);
  }
}

export function createHaircutStyle(serviceId, fields) {
  if (!API_ROOT) {
    const services = getStandaloneServices();
    const service = services.find((s) => String(s.id) === String(serviceId));
    if (service) {
      if (!service.styles) service.styles = [];
      const newStyle = { id: Date.now(), name: fields.name };
      service.styles.push(newStyle);
      saveStandaloneService(service);
      return Promise.resolve(newStyle);
    }
    return Promise.resolve({ id: Date.now(), name: fields.name });
  }

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
  if (!API_ROOT) {
    const services = getStandaloneServices();
    const service = services.find((s) => String(s.id) === String(serviceId));
    if (service && service.styles) {
      service.styles = service.styles.filter((st) => String(st.id) !== String(styleId));
      saveStandaloneService(service);
    }
    return Promise.resolve();
  }
  return api
    .delete(`/services/${serviceId}/styles/${styleId}/`, {
      requiresAuth: true,
    })
    .then(() => undefined);
}
