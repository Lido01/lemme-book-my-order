import { useState, useRef } from "react";
import {
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  Phone,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
  Sparkles,
} from "lucide-react";

import {
  deleteStandaloneBarber,
  deleteStandaloneGallery,
  deleteStandaloneService,
  deleteStandaloneBooking,
  getStandaloneBarbers,
  getStandaloneGallery,
  getStandaloneServices,
  getStandaloneBookings,
  saveStandaloneBarber,
  saveStandaloneGallery,
  saveStandaloneService,
  updateStandaloneBookingStatus,
} from "../../services/standaloneStore";
import {
  isSupabaseConfigured,
  upsertSupabaseService,
  deleteSupabaseService as deleteSupaService,
  upsertSupabaseBarber,
  deleteSupabaseBarber as deleteSupaBarber,
  upsertSupabaseGallery,
  deleteSupabaseGallery as deleteSupaGallery,
} from "../../services/supabase";
import { invalidateQuery } from "../../hooks/useQuery";
import { mediaUrl, DEFAULT_FALLBACK_IMAGE } from "../../services/api";
import { formatDuration, formatPrice } from "../../utils/format";

const PRESET_IMAGES = [
  { label: "Fade", url: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=800&q=80" },
  { label: "Mid Fade", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" },
  { label: "Skin Fade", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80" },
  { label: "Crop", url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80" },
  { label: "Classic", url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80" },
  { label: "Beard", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
];

const BARBER_PRESET_IMAGES = [
  { label: "Daniel", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { label: "Samuel", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
  { label: "Michael", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80" },
  { label: "Master", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
];

/**
 * Image upload + preset picker component
 */
function ImageUploadField({ value, onChange, presets = PRESET_IMAGES, label = "Haircut Image" }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (PNG, JPG, WebP)");
      return;
    }

    // Convert file to base64 Data URL so it is stored directly in browser / db
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">
          {label}
        </label>
        <span className="text-[10px] text-console-muted">Upload or pick preset</span>
      </div>

      {/* Image Preview & Upload Button */}
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-console-line bg-console">
          <img
            src={mediaUrl(value)}
            alt="Preview"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-console-line bg-console px-3 py-2 text-xs font-medium text-console-ink hover:border-console-accent transition cursor-pointer"
          >
            <Upload size={13} className="text-console-accent" />
            <span>Upload From Device / Camera</span>
          </button>

          <input
            type="text"
            placeholder="Or paste image URL (https://...)"
            value={value?.startsWith("data:") ? "[Uploaded image file]" : value}
            onChange={(e) => {
              if (!e.target.value.startsWith("[Uploaded")) {
                onChange(e.target.value);
              }
            }}
            className="w-full rounded-md border border-console-line bg-console px-2.5 py-1 text-[11px] text-console-ink outline-none focus:border-console-accent"
          />
        </div>
      </div>

      {/* Presets chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1">
        {presets.map((preset) => (
          <button
            type="button"
            key={preset.label}
            onClick={() => onChange(preset.url)}
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
              value === preset.url
                ? "border-console-accent bg-console-accent/20 text-console-ink font-semibold"
                : "border-console-line bg-console text-console-muted hover:text-console-ink"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminMobileAssetHub({ onRefresh }) {
  const [activeTab, setActiveTab] = useState("services"); // "services" | "barbers" | "gallery" | "bookings"
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all"); // "all" | "confirmed" | "completed" | "cancelled"

  // Lists state
  const [services, setServices] = useState(getStandaloneServices);
  const [barbers, setBarbers] = useState(getStandaloneBarbers);
  const [gallery, setGallery] = useState(getStandaloneGallery);
  const [bookings, setBookings] = useState(getStandaloneBookings);

  // Form states
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "350",
    duration: "40",
    image: PRESET_IMAGES[0].url,
    description: "",
  });

  const [barberForm, setBarberForm] = useState({
    name: "",
    role: "Master Barber",
    specialty: "Fades & Styling",
    image: BARBER_PRESET_IMAGES[0].url,
  });

  const [galleryForm, setGalleryForm] = useState({
    title: "",
    style_name: "Modern Look",
    image: PRESET_IMAGES[0].url,
  });

  const reloadAll = () => {
    setServices([...getStandaloneServices()]);
    setBarbers([...getStandaloneBarbers()]);
    setGallery([...getStandaloneGallery()]);
    setBookings([...getStandaloneBookings()]);
    invalidateQuery("services");
    invalidateQuery("barbers");
    invalidateQuery("gallery");
    if (onRefresh) onRefresh();
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    const payload = {
      name: serviceForm.name.trim(),
      price: serviceForm.price,
      duration: parseInt(serviceForm.duration, 10) || 40,
      image: serviceForm.image || PRESET_IMAGES[0].url,
      description: serviceForm.description || "Studio haircut and grooming",
      is_active: true,
    };

    saveStandaloneService(payload);
    if (isSupabaseConfigured()) {
      upsertSupabaseService(payload).catch(() => {});
    }

    setServiceForm({ name: "", price: "350", duration: "40", image: PRESET_IMAGES[0].url, description: "" });
    setShowAddModal(false);
    reloadAll();
  };

  const handleAddBarber = (e) => {
    e.preventDefault();
    if (!barberForm.name.trim()) return;

    const payload = {
      name: barberForm.name.trim(),
      role: barberForm.role,
      specialty: barberForm.specialty,
      image: barberForm.image || BARBER_PRESET_IMAGES[0].url,
      is_active: true,
    };

    saveStandaloneBarber(payload);
    if (isSupabaseConfigured()) {
      upsertSupabaseBarber(payload).catch(() => {});
    }

    setBarberForm({ name: "", role: "Master Barber", specialty: "Fades & Styling", image: BARBER_PRESET_IMAGES[0].url });
    setShowAddModal(false);
    reloadAll();
  };

  const handleAddGallery = (e) => {
    e.preventDefault();
    if (!galleryForm.title.trim()) return;

    const payload = {
      title: galleryForm.title.trim(),
      style_name: galleryForm.style_name || "Modern Haircut",
      image: galleryForm.image || PRESET_IMAGES[0].url,
      is_active: true,
    };

    saveStandaloneGallery(payload);
    if (isSupabaseConfigured()) {
      upsertSupabaseGallery(payload).catch(() => {});
    }

    setGalleryForm({ title: "", style_name: "Modern Look", image: PRESET_IMAGES[0].url });
    setShowAddModal(false);
    reloadAll();
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Remove this service from customer booking?")) {
      deleteStandaloneService(id);
      if (isSupabaseConfigured()) {
        deleteSupaService(id).catch(() => {});
      }
      reloadAll();
    }
  };

  const handleDeleteBarber = (id) => {
    if (window.confirm("Remove this barber from staff list?")) {
      deleteStandaloneBarber(id);
      if (isSupabaseConfigured()) {
        deleteSupaBarber(id).catch(() => {});
      }
      reloadAll();
    }
  };

  const handleDeleteGallery = (id) => {
    if (window.confirm("Remove photo from showcase gallery?")) {
      deleteStandaloneGallery(id);
      if (isSupabaseConfigured()) {
        deleteSupaGallery(id).catch(() => {});
      }
      reloadAll();
    }
  };

  const handleToggleService = (s) => {
    saveStandaloneService({ ...s, is_active: !s.is_active });
    reloadAll();
  };

  const handleUpdateBookingStatus = (id, newStatus) => {
    updateStandaloneBookingStatus(id, newStatus);
    reloadAll();
  };

  const handleDeleteBookingItem = (id) => {
    if (window.confirm("Delete this booking record?")) {
      deleteStandaloneBooking(id);
      reloadAll();
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="rounded-2xl border border-console-line bg-console-raised p-4 sm:p-6 shadow-sm">
      {/* Header with Quick Add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-console-line pb-4">
        <div>
          <h2 className="text-base font-bold text-console-ink flex items-center gap-2">
            <span>📱 Admin Management Hub</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-console-accent/15 text-console-accent px-2 py-0.5 rounded-full">
              Mobile & Cloud Ready
            </span>
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Add haircut images, manage barbers, and update customer bookings on any device.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={reloadAll}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-console-line bg-console text-console-muted hover:text-console-ink transition cursor-pointer"
            title="Refresh assets"
          >
            <RefreshCw size={15} />
          </button>

          {activeTab !== "bookings" && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex min-h-[40px] flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-console-accent px-4 py-2 text-xs font-semibold text-console-on-accent transition hover:opacity-90 cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              <span>Add {activeTab === "services" ? "Haircut" : activeTab === "barbers" ? "Barber" : "Photo"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === "services"
              ? "bg-console-accent text-console-on-accent"
              : "bg-console text-console-muted hover:text-console-ink"
          }`}
        >
          <Scissors size={14} />
          <span>Services ({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("barbers")}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === "barbers"
              ? "bg-console-accent text-console-on-accent"
              : "bg-console text-console-muted hover:text-console-ink"
          }`}
        >
          <Users size={14} />
          <span>Barbers ({barbers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === "gallery"
              ? "bg-console-accent text-console-on-accent"
              : "bg-console text-console-muted hover:text-console-ink"
          }`}
        >
          <ImageIcon size={14} />
          <span>Gallery ({gallery.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === "bookings"
              ? "bg-console-accent text-console-on-accent"
              : "bg-console text-console-muted hover:text-console-ink"
          }`}
        >
          <Calendar size={14} />
          <span>Customer Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* ----------------- SERVICES LIST ----------------- */}
      {activeTab === "services" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {services.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-console-line bg-console p-3 transition hover:border-console-accent/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={mediaUrl(item.image)}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                  }}
                  className="h-14 w-14 rounded-lg object-cover shrink-0 border border-console-line"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-console-ink truncate">{item.name}</h4>
                    <span
                      onClick={() => handleToggleService(item)}
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded cursor-pointer ${
                        item.is_active
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-console-line text-console-muted"
                      }`}
                    >
                      {item.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <p className="text-[11px] text-console-muted mt-0.5">
                    {formatPrice(item.price)} · {item.duration} min
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteService(item.id)}
                className="p-2 text-console-muted hover:text-red-500 transition cursor-pointer shrink-0"
                title="Delete Service"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- BARBERS LIST ----------------- */}
      {activeTab === "barbers" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {barbers.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-console-line bg-console p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={mediaUrl(item.image)}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.src = BARBER_PRESET_IMAGES[0].url;
                  }}
                  className="h-12 w-12 rounded-full object-cover shrink-0 border border-console-line"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-console-ink truncate">{item.name}</h4>
                  <p className="text-[11px] text-console-muted truncate">{item.role} · {item.specialty}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteBarber(item.id)}
                className="p-2 text-console-muted hover:text-red-500 transition cursor-pointer shrink-0"
                title="Delete Barber"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- GALLERY LIST ----------------- */}
      {activeTab === "gallery" && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl border border-console-line bg-console overflow-hidden"
            >
              <img
                src={mediaUrl(item.image)}
                alt={item.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                }}
                className="h-32 w-full object-cover"
              />
              <div className="p-2">
                <p className="text-xs font-semibold text-console-ink truncate">{item.title}</p>
                <p className="text-[10px] text-console-muted">{item.style_name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteGallery(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white/80 hover:text-red-400 cursor-pointer transition shadow"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- CUSTOMER BOOKINGS LIST ----------------- */}
      {activeTab === "bookings" && (
        <div className="mt-4 space-y-3">
          {/* Booking Filter Chips */}
          <div className="flex gap-2 pb-1 overflow-x-auto">
            {["all", "confirmed", "completed", "cancelled"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setBookingFilter(filter)}
                className={`text-[11px] px-3 py-1 rounded-full border uppercase tracking-wider font-semibold transition cursor-pointer ${
                  bookingFilter === filter
                    ? "bg-console-accent text-console-on-accent border-console-accent"
                    : "bg-console border-console-line text-console-muted hover:text-console-ink"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-console-line p-8 text-center text-xs text-console-muted">
              No customer bookings found in this category. New reservations placed in the web app or Telegram Mini App will show up here live.
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-console-line bg-console p-4 transition hover:border-console-accent/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-console-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-console-accent">
                        {b.booking_code || `#${b.id}`}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          b.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : b.status === "cancelled"
                            ? "bg-red-500/15 text-red-500"
                            : "bg-amber-500/15 text-amber-500"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-console-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {b.booking_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {b.start_time}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-console-ink">
                        {b.customer_name}
                      </h4>
                      <p className="text-xs text-console-muted mt-0.5">
                        Style: <span className="text-console-ink font-medium">{b.service_name}</span> · {formatPrice(b.price)}
                      </p>
                      {b.notes && (
                        <p className="mt-1 text-[11px] text-console-muted italic line-clamp-1">
                          Note: "{b.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {b.customer_phone && (
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="flex items-center gap-1.5 rounded-lg border border-console-line bg-console-raised px-3 py-1.5 text-xs text-console-ink hover:border-console-accent transition"
                        >
                          <Phone size={13} className="text-emerald-500" />
                          <span>Call</span>
                        </a>
                      )}

                      {b.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, "completed")}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/25 transition cursor-pointer"
                        >
                          <CheckCheck size={14} />
                          <span>Done</span>
                        </button>
                      )}

                      {b.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}
                          className="flex items-center gap-1 rounded-lg bg-console-accent/20 px-3 py-1.5 text-xs font-semibold text-console-accent hover:bg-console-accent/30 transition cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Confirm</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteBookingItem(b.id)}
                        className="p-1.5 text-console-muted hover:text-red-500 transition cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- QUICK ADD MODAL ----------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-console-line bg-console-raised p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-console-line pb-3">
              <h3 className="text-sm font-bold text-console-ink">
                Add {activeTab === "services" ? "Haircut Service" : activeTab === "barbers" ? "Barber" : "Gallery Photo"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-console-muted hover:text-console-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Service Form */}
            {activeTab === "services" && (
              <form onSubmit={handleAddService} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skin Fade Haircut"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Price (ETB)</label>
                    <input
                      type="number"
                      required
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Duration (Min)</label>
                    <input
                      type="number"
                      required
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Description</label>
                  <input
                    type="text"
                    placeholder="Short description for customers"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <ImageUploadField
                  value={serviceForm.image}
                  onChange={(img) => setServiceForm({ ...serviceForm, image: img })}
                  presets={PRESET_IMAGES}
                  label="Haircut Image / Photo"
                />

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-console-accent py-2.5 text-xs font-bold text-console-on-accent transition hover:opacity-90 cursor-pointer"
                >
                  Save Haircut Service
                </button>
              </form>
            )}

            {/* Barber Form */}
            {activeTab === "barbers" && (
              <form onSubmit={handleAddBarber} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Barber Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daniel Tesfaye"
                    value={barberForm.name}
                    onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Role</label>
                    <input
                      type="text"
                      value={barberForm.role}
                      onChange={(e) => setBarberForm({ ...barberForm, role: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Specialty</label>
                    <input
                      type="text"
                      value={barberForm.specialty}
                      onChange={(e) => setBarberForm({ ...barberForm, specialty: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                    />
                  </div>
                </div>

                <ImageUploadField
                  value={barberForm.image}
                  onChange={(img) => setBarberForm({ ...barberForm, image: img })}
                  presets={BARBER_PRESET_IMAGES}
                  label="Barber Portrait Photo"
                />

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-console-accent py-2.5 text-xs font-bold text-console-on-accent transition hover:opacity-90 cursor-pointer"
                >
                  Save Barber
                </button>
              </form>
            )}

            {/* Gallery Form */}
            {activeTab === "gallery" && (
              <form onSubmit={handleAddGallery} className="mt-4 space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Cut Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textured French Crop"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Style Category</label>
                  <input
                    type="text"
                    value={galleryForm.style_name}
                    onChange={(e) => setGalleryForm({ ...galleryForm, style_name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <ImageUploadField
                  value={galleryForm.image}
                  onChange={(img) => setGalleryForm({ ...galleryForm, image: img })}
                  presets={PRESET_IMAGES}
                  label="Showcase Photo"
                />

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-console-accent py-2.5 text-xs font-bold text-console-on-accent transition hover:opacity-90 cursor-pointer"
                >
                  Save Photo
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
