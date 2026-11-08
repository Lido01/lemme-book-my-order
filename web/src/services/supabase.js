/**
 * Supabase Cloud Database Connector for NOIR Barbers
 * 
 * Works with zero additional npm packages using native fetch against Supabase PostgREST.
 * When VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in .env,
 * all asset and booking operations synchronize with Supabase in real-time.
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);

async function supabaseFetch(table, { method = "GET", body, params = "" } = {}) {
  if (!isSupabaseConfigured()) return null;

  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? `?${params}` : ""}`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" || method === "PATCH" ? "return=representation" : "count=none",
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Supabase Error] ${method} ${table}:`, errText);
      return null;
    }

    if (method === "DELETE") return true;
    return await res.json();
  } catch (err) {
    console.error(`[Supabase Network Error] ${table}:`, err.message);
    return null;
  }
}

// ------------------------------------------------------------------
// SERVICES TABLE
// ------------------------------------------------------------------

export async function fetchSupabaseServices() {
  return supabaseFetch("services", { params: "select=*&order=id.asc" });
}

export async function upsertSupabaseService(service) {
  return supabaseFetch("services", {
    method: "POST",
    params: "on_conflict=id",
    body: service,
  });
}

export async function deleteSupabaseService(id) {
  return supabaseFetch("services", {
    method: "DELETE",
    params: `id=eq.${id}`,
  });
}

// ------------------------------------------------------------------
// BARBERS TABLE
// ------------------------------------------------------------------

export async function fetchSupabaseBarbers() {
  return supabaseFetch("barbers", { params: "select=*&order=id.asc" });
}

export async function upsertSupabaseBarber(barber) {
  return supabaseFetch("barbers", {
    method: "POST",
    params: "on_conflict=id",
    body: barber,
  });
}

export async function deleteSupabaseBarber(id) {
  return supabaseFetch("barbers", {
    method: "DELETE",
    params: `id=eq.${id}`,
  });
}

// ------------------------------------------------------------------
// BOOKINGS TABLE
// ------------------------------------------------------------------

export async function fetchSupabaseBookings() {
  return supabaseFetch("bookings", { params: "select=*&order=created_at.desc" });
}

export async function insertSupabaseBooking(booking) {
  return supabaseFetch("bookings", {
    method: "POST",
    body: booking,
  });
}

export async function updateSupabaseBookingStatus(id, status) {
  return supabaseFetch("bookings", {
    method: "PATCH",
    params: `id=eq.${id}`,
    body: { status, updated_at: new Date().toISOString() },
  });
}

// ------------------------------------------------------------------
// GALLERY TABLE
// ------------------------------------------------------------------

export async function fetchSupabaseGallery() {
  return supabaseFetch("gallery", { params: "select=*&order=id.asc" });
}

export async function upsertSupabaseGallery(item) {
  return supabaseFetch("gallery", {
    method: "POST",
    params: "on_conflict=id",
    body: item,
  });
}

export async function deleteSupabaseGallery(id) {
  return supabaseFetch("gallery", {
    method: "DELETE",
    params: `id=eq.${id}`,
  });
}
