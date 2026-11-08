import { useState } from "react";
import {
  Check,
  CheckCheck,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Scissors,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  deleteStandaloneBarber,
  deleteStandaloneGallery,
  deleteStandaloneService,
  getStandaloneBarbers,
  getStandaloneGallery,
  getStandaloneServices,
  saveStandaloneBarber,
  saveStandaloneGallery,
  saveStandaloneService,
  updateStandaloneBookingStatus,
} from "../../services/standaloneStore";
import { invalidateQuery } from "../../hooks/useQuery";

const PRESET_IMAGES = [
  { label: "Fade", url: "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=800&q=80" },
  { label: "Classic", url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80" },
  { label: "Crop", url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80" },
  { label: "Skin Fade", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80" },
];

export default function AdminMobileAssetHub({ onRefresh }) {
  const [activeTab, setActiveTab] = useState("services"); // "services" | "barbers" | "gallery" | "bookings"
  const [showAddModal, setShowAddModal] = useState(false);

  // Lists state
  const [services, setServices] = useState(getStandaloneServices);
  const [barbers, setBarbers] = useState(getStandaloneBarbers);
  const [gallery, setGallery] = useState(getStandaloneGallery);

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
    image: "/images/barbers/daniel.webp",
  });

  const [galleryForm, setGalleryForm] = useState({
    title: "",
    style_name: "Modern Cut",
    image: PRESET_IMAGES[0].url,
  });

  const reloadAll = () => {
    setServices([...getStandaloneServices()]);
    setBarbers([...getStandaloneBarbers()]);
    setGallery([...getStandaloneGallery()]);
    invalidateQuery("services");
    invalidateQuery("barbers");
    invalidateQuery("gallery");
    if (onRefresh) onRefresh();
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    saveStandaloneService({
      name: serviceForm.name.trim(),
      price: serviceForm.price,
      duration: serviceForm.duration,
      image: serviceForm.image,
      description: serviceForm.description || "Studio grooming service",
      is_active: true,
    });

    setServiceForm({ name: "", price: "350", duration: "40", image: PRESET_IMAGES[0].url, description: "" });
    setShowAddModal(false);
    reloadAll();
  };

  const handleAddBarber = (e) => {
    e.preventDefault();
    if (!barberForm.name.trim()) return;

    saveStandaloneBarber({
      name: barberForm.name.trim(),
      role: barberForm.role,
      specialty: barberForm.specialty,
      image: barberForm.image,
      is_active: true,
    });

    setBarberForm({ name: "", role: "Master Barber", specialty: "Fades & Styling", image: "/images/barbers/daniel.webp" });
    setShowAddModal(false);
    reloadAll();
  };

  const handleAddGallery = (e) => {
    e.preventDefault();
    if (!galleryForm.title.trim()) return;

    saveStandaloneGallery({
      title: galleryForm.title.trim(),
      style_name: galleryForm.style_name,
      image: galleryForm.image,
      is_active: true,
    });

    setGalleryForm({ title: "", style_name: "Modern Cut", image: PRESET_IMAGES[0].url });
    setShowAddModal(false);
    reloadAll();
  };

  const handleDeleteService = (id) => {
    if (window.confirm("Remove this service from booking?")) {
      deleteStandaloneService(id);
      reloadAll();
    }
  };

  const handleDeleteBarber = (id) => {
    if (window.confirm("Remove this barber from the roster?")) {
      deleteStandaloneBarber(id);
      reloadAll();
    }
  };

  const handleDeleteGallery = (id) => {
    if (window.confirm("Remove photo from gallery?")) {
      deleteStandaloneGallery(id);
      reloadAll();
    }
  };

  const handleToggleService = (s) => {
    saveStandaloneService({ ...s, is_active: !s.is_active });
    reloadAll();
  };

  return (
    <div className="rounded-2xl border border-console-line bg-console-raised p-4 sm:p-6 shadow-sm">
      {/* Header with Quick Add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-console-line pb-4">
        <div>
          <h2 className="text-base font-bold text-console-ink flex items-center gap-2">
            <span>📱 Mobile Asset Manager</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-console-accent/15 text-console-accent px-2 py-0.5 rounded-full">
              Live Store
            </span>
          </h2>
          <p className="text-xs text-console-muted mt-0.5">
            Manage services, barbers, and portfolio assets across web & Telegram.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-console-accent px-4 py-2 text-xs font-semibold text-console-on-accent transition hover:opacity-90 cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus size={16} />
          <span>Add New {activeTab === "services" ? "Haircut" : activeTab === "barbers" ? "Barber" : "Photo"}</span>
        </button>
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
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg object-cover shrink-0 border border-console-line"
                  />
                )}
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
                  <p className="text-[11px] text-console-muted">
                    {item.price} ETB · {item.duration} min
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteService(item.id)}
                className="p-2 text-console-muted hover:text-red-500 transition cursor-pointer"
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
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-console-accent/15 text-console-accent font-bold text-sm">
                  {item.name[0]}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-console-ink truncate">{item.name}</h4>
                  <p className="text-[11px] text-console-muted truncate">{item.role} · {item.specialty}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteBarber(item.id)}
                className="p-2 text-console-muted hover:text-red-500 transition cursor-pointer"
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
                src={item.image}
                alt={item.title}
                className="h-28 w-full object-cover"
              />
              <div className="p-2">
                <p className="text-xs font-semibold text-console-ink truncate">{item.title}</p>
                <p className="text-[10px] text-console-muted">{item.style_name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteGallery(item.id)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white/80 hover:text-red-400 cursor-pointer transition"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- QUICK ADD MODAL ----------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-console-line bg-console-raised p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-console-line pb-3">
              <h3 className="text-sm font-bold text-console-ink">
                Add {activeTab === "services" ? "Haircut Service" : activeTab === "barbers" ? "Barber" : "Gallery Asset"}
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
              <form onSubmit={handleAddService} className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Service Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharp Taper Fade"
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
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Image Preset / URL</label>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        type="button"
                        key={img.label}
                        onClick={() => setServiceForm({ ...serviceForm, image: img.url })}
                        className={`text-[10px] px-2.5 py-1 rounded border cursor-pointer ${
                          serviceForm.image === img.url
                            ? "border-console-accent bg-console-accent/20 text-console-ink font-semibold"
                            : "border-console-line bg-console text-console-muted"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-console-accent py-2.5 text-xs font-bold text-console-on-accent transition hover:opacity-90 cursor-pointer"
                >
                  Save Service
                </button>
              </form>
            )}

            {/* Barber Form */}
            {activeTab === "barbers" && (
              <form onSubmit={handleAddBarber} className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Barber Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dawit Kebede"
                    value={barberForm.name}
                    onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

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
              <form onSubmit={handleAddGallery} className="mt-4 space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Photo Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textured Buzz Cut"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-console-muted tracking-wider">Style Variant</label>
                  <input
                    type="text"
                    value={galleryForm.style_name}
                    onChange={(e) => setGalleryForm({ ...galleryForm, style_name: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-console-line bg-console px-3 py-2 text-xs text-console-ink outline-none focus:border-console-accent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-console-accent py-2.5 text-xs font-bold text-console-on-accent transition hover:opacity-90 cursor-pointer"
                >
                  Save to Gallery
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
