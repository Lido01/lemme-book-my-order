import api, { API_ROOT } from "./api";
import { haircuts } from "../data/haircuts";

const FALLBACK_POSTS = haircuts.map((h, i) => ({
  id: i + 1,
  title: h.name,
  description: h.description,
  style_name: h.name,
  is_active: true,
  image: h.image,
}));

export async function listGalleryPosts({ signal, requiresAuth } = {}) {
  if (!API_ROOT) {
    return FALLBACK_POSTS;
  }
  try {
    const response = await api.get("/gallery/gallery/", { signal, requiresAuth });
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data
      : FALLBACK_POSTS;
  } catch (err) {
    return FALLBACK_POSTS;
  }
}

export async function getGalleryPost(id, { signal } = {}) {
  if (!API_ROOT) {
    return FALLBACK_POSTS.find((p) => String(p.id) === String(id)) || FALLBACK_POSTS[0];
  }
  try {
    const response = await api.get(`/gallery/gallery/${id}/`, { signal });
    return response.data;
  } catch (err) {
    return FALLBACK_POSTS.find((p) => String(p.id) === String(id)) || FALLBACK_POSTS[0];
  }
}

// --- admin only ---------------------------------------------------

export function createGalleryPost(fields) {
  const formData = new FormData();

  if (fields.title) formData.append("title", fields.title);
  if (fields.description) formData.append("description", fields.description);
  if (fields.style_name) formData.append("style_name", fields.style_name);
  if (fields.is_active !== undefined) {
    formData.append("is_active", fields.is_active ? "true" : "false");
  }
  if (fields.image) formData.append("image", fields.image);

  return api
    .post("/gallery/gallery/", formData, { requiresAuth: true })
    .then((response) => response.data);
}

export function updateGalleryPost(id, fields) {
  const formData = new FormData();

  if (fields.title !== undefined) formData.append("title", fields.title);
  if (fields.description !== undefined) {
    formData.append("description", fields.description);
  }
  if (fields.style_name !== undefined) {
    formData.append("style_name", fields.style_name);
  }
  if (fields.is_active !== undefined) {
    formData.append("is_active", fields.is_active ? "true" : "false");
  }
  if (fields.image) formData.append("image", fields.image);

  return api
    .patch(`/gallery/gallery/${id}/`, formData, { requiresAuth: true })
    .then((response) => response.data);
}

export function deleteGalleryPost(id) {
  return api
    .delete(`/gallery/gallery/${id}/`, { requiresAuth: true })
    .then(() => undefined);
}
