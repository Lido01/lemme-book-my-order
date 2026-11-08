import api, { API_ROOT } from "./api";
import {
  deleteStandaloneService,
  getStandaloneServices,
  saveStandaloneService,
} from "./standaloneStore";
import {
  isSupabaseConfigured,
  fetchSupabaseServices,
  upsertSupabaseService,
  deleteSupabaseService as deleteFromSupabase,
} from "./supabase";

/**
 * Services — GET /api/services/
 *
 * Supports Supabase Cloud Database, Django backend API, and local storage fallback.
 */

export async function listServices({ signal } = {}) {
  if (isSupabaseConfigured()) {
    try {
      const supaServices = await fetchSupabaseServices();
      if (Array.isArray(supaServices) && supaServices.length > 0) {
        return supaServices;
      }
    } catch (err) {
      console.warn("[servicesApi] Supabase fetch fallback:", err);
    }
  }

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
  if (isSupabaseConfigured()) {
    try {
      const supaServices = await fetchSupabaseServices();
      const match = supaServices?.find((s) => String(s.id) === String(id));
      if (match) return match;
    } catch {}
  }

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
  return listServices({ signal });
}

export async function createService(fields) {
  if (isSupabaseConfigured()) {
    try {
      await upsertSupabaseService(fields);
    } catch (e) {
      console.warn("[servicesApi] Supabase upsert error:", e);
    }
  }

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
  if (isSupabaseConfigured()) {
    try {
      await upsertSupabaseService({ ...fields, id });
    } catch (e) {
      console.warn("[servicesApi] Supabase update error:", e);
    }
  }

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
  if (isSupabaseConfigured()) {
    try {
      await deleteFromSupabase(id);
    } catch {}
  }

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
  const services = getStandaloneServices();
  const service = services.find((s) => String(s.id) === String(serviceId));
  if (service) {
    if (!service.styles) service.styles = [];
    const newStyle = { id: Date.now(), name: fields.name };
    service.styles.push(newStyle);
    saveStandaloneService(service);
    if (isSupabaseConfigured()) {
      upsertSupabaseService(service).catch(() => {});
    }
    return Promise.resolve(newStyle);
  }
  return Promise.resolve({ id: Date.now(), name: fields.name });
}

export function deleteHaircutStyle(serviceId, styleId) {
  const services = getStandaloneServices();
  const service = services.find((s) => String(s.id) === String(serviceId));
  if (service && service.styles) {
    service.styles = service.styles.filter((st) => String(st.id) !== String(styleId));
    saveStandaloneService(service);
    if (isSupabaseConfigured()) {
      upsertSupabaseService(service).catch(() => {});
    }
  }
  return Promise.resolve();
}
