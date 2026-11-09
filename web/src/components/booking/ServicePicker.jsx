import { useState } from "react";
import { Check, ChevronDown, Clock3, LayoutGrid, ListFilter } from "lucide-react";

import { mediaUrl, DEFAULT_FALLBACK_IMAGE } from "../../services/api";
import { formatDuration, formatPrice } from "../../utils/format";
import { useTelegram } from "../../hooks/useTelegram";
import Alert from "../ui/Alert";
import Spinner from "../ui/Spinner";

export default function ServicePicker({
  services,
  loading,
  error,
  onReload,
  selectedId,
  onSelect,
  disabled = false,
}) {
  const telegram = useTelegram();
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "dropdown"

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center">
        <Spinner label="Loading haircuts & services..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        tone="error"
        title="Could not load services"
        details={error.fieldErrors}
        onRetry={onReload}
      >
        {error.message}
      </Alert>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Alert tone="info" title="No services available yet" onRetry={onReload}>
        The shop has not published any services. Please check back soon.
      </Alert>
    );
  }

  const selectedService = services.find(
    (service) => String(service.id) === String(selectedId)
  );

  const handleCardClick = (service) => {
    if (disabled) return;
    telegram.haptic("selection");
    onSelect(service);
  };

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-medium text-white/50">
          {viewMode === "cards" ? "Tap a haircut to select" : "Choose from dropdown"}
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition cursor-pointer ${
              viewMode === "cards"
                ? "bg-[#d6a85f] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutGrid size={12} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("dropdown")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition cursor-pointer ${
              viewMode === "dropdown"
                ? "bg-[#d6a85f] text-black font-semibold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <ListFilter size={12} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Visual Cards View (Default) */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {services.map((service) => {
            const isSelected = String(service.id) === String(selectedId);
            const imgSrc = mediaUrl(service.image);

            return (
              <button
                type="button"
                key={service.id}
                onClick={() => handleCardClick(service)}
                disabled={disabled}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#d6a85f] bg-[#d6a85f]/[0.08] ring-2 ring-[#d6a85f]/40 shadow-lg shadow-[#d6a85f]/10"
                    : "border-white/10 bg-[#161616] hover:border-white/25 hover:bg-[#1a1a1a]"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {/* Haircut Image */}
                <div className="relative h-28 w-full overflow-hidden bg-[#202020] sm:h-32">
                  <img
                    src={imgSrc}
                    alt={service.name}
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className={`h-full w-full object-cover transition duration-500 ${
                      isSelected ? "scale-105" : "group-hover:scale-105"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Selection Checkmark */}
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#d6a85f] text-black shadow-md">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur-sm">
                    <Clock3 size={11} className="text-[#d6a85f]" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <div>
                    <h4 className={`text-xs font-semibold leading-tight line-clamp-1 ${
                      isSelected ? "text-[#d6a85f]" : "text-white"
                    }`}>
                      {service.name}
                    </h4>
                    {service.description && (
                      <p className="mt-1 line-clamp-1 text-[10px] text-white/45">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                    <span className="font-bold text-white">
                      {formatPrice(service.price)}
                    </span>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${
                      isSelected ? "text-[#d6a85f]" : "text-white/40"
                    }`}>
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Dropdown Mode */
        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedId || ""}
              onChange={(event) => {
                const service = services.find(
                  (item) => String(item.id) === event.target.value
                );
                if (service) {
                  telegram.haptic("selection");
                  onSelect(service);
                }
              }}
              disabled={disabled}
              aria-label="Choose a service"
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#181818] px-4 py-4 pr-12 text-sm text-white outline-none transition focus:border-[#d6a85f]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Choose a haircut style...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {formatPrice(service.price)} · {formatDuration(service.duration)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#d6a85f]"
            />
          </div>

          {selectedService && (
            <div className="flex items-center gap-3 rounded-xl border border-[#d6a85f]/25 bg-[#d6a85f]/[0.06] p-3">
              <img
                src={mediaUrl(selectedService.image)}
                alt={selectedService.name}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                }}
                className="h-16 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{selectedService.name}</p>
                {selectedService.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/50">
                    {selectedService.description}
                  </p>
                )}
                <p className="mt-1 flex items-center gap-2 text-xs text-[#d6a85f] font-medium">
                  <span>{formatPrice(selectedService.price)}</span>
                  <span>·</span>
                  <span>{formatDuration(selectedService.duration)}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
