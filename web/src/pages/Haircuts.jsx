import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, X, Scissors } from "lucide-react";
import { Link } from "react-router-dom";

import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import { useServices } from "../hooks/useServices";
import { mediaUrl, DEFAULT_FALLBACK_IMAGE } from "../services/api";
import { formatDuration, formatPrice } from "../utils/format";

/**
 * Haircut collection — built from GET /api/services/.
 *
 * Each "haircut" is a haircut style belonging to a service. Clicking a
 * haircut opens its details and lets the customer book that service or
 * open the full service details page.
 */
export default function Haircuts() {
  const { services, loading, error, reload } = useServices();

  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  // Flatten services + styles into a single list of "haircuts".
  const haircuts = useMemo(() => {
    const rows = [];

    for (const service of services) {
      const styles = Array.isArray(service.styles) ? service.styles : [];

      if (styles.length > 0) {
        for (const style of styles) {
          rows.push({
            ...style,
            image: style.image || service.image,
            category: style.category || service.name,
            service,
          });
        }
      } else {
        rows.push({
          ...service,
          image: service.image,
          service,
          isServiceRoot: true,
        });
      }
    }

    return rows;
  }, [services]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        haircuts
          .map((cut) => cut.category || cut.service?.name)
          .filter(Boolean)
      ),
    ],
    [haircuts]
  );

  const shown =
    category === "All"
      ? haircuts
      : haircuts.filter(
          (cut) => (cut.category || cut.service?.name) === category
        );

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <div className="min-h-screen bg-[#090909] px-5 pb-24 pt-28 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        {loading && (
          <div className="mt-14 flex items-center justify-center border border-white/10 bg-[#111] py-24">
            <Spinner label="Loading haircuts..." />
          </div>
        )}

        {!loading && error && (
          <Alert
            tone="error"
            title="Could not load haircuts"
            details={error.fieldErrors}
            onRetry={reload}
            className="mt-14"
          >
            {error.message}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="mt-4 font-serif text-5xl leading-none sm:text-7xl">
                  Haircuts & Styles
                </h1>
              </div>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((cut) => {
                const imgUrl = cut.image || cut.service?.image;
                return (
                  <button
                    key={`${cut.service?.id || "root"}-${cut.id || cut.name}`}
                    onClick={() => setSelected(cut)}
                    className="group relative min-h-[420px] overflow-hidden  border border-white/10 bg-[#111] text-left transition hover:border-[#d6a85f]/50 cursor-pointer"
                  >
                    <img
                      src={mediaUrl(imgUrl)}
                      alt={cut.name}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-black/20" />
                    
                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                      <span className="font-serif text-3xl font-bold text-white/40">
                        {cut.service?.id || "N"}
                      </span>
                      <span className=" border border-white/20 bg-black/60 px-3 py-1 text-[9px] uppercase tracking-widest text-[#d6a85f] backdrop-blur">
                        {cut.service?.name || "Service"}
                      </span>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-3xl font-medium text-white">{cut.name}</h2>
                          {cut.description && (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/65">
                              {cut.description}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight
                          size={22}
                          className="mb-1 shrink-0 text-[#d6a85f] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 text-sm">
                        <span className="font-bold text-white">
                          {formatPrice(cut.service?.price)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-[#d6a85f]">
                          <Clock3 size={13} />
                          {formatDuration(cut.service?.duration)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selected && <CutModal cut={selected} close={() => setSelected(null)} />}
    </div>
  );
}

function CutModal({ cut, close }) {
  const imageSource = cut.image || cut.service?.image;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end bg-black/85 p-3 backdrop-blur-md sm:items-center sm:justify-center sm:p-6"
      onMouseDown={close}
    >
      <article
        className="relative max-h-[92svh] w-full max-w-3xl overflow-auto border border-white/15 bg-[#121212] sm:grid sm:grid-cols-2"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close details"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center  border border-white/10 bg-black/70 text-white backdrop-blur transition hover:bg-[#d6a85f] hover:text-black cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="relative h-72 sm:h-full sm:min-h-[480px]">
          <img
            src={mediaUrl(imageSource)}
            alt={cut.name}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent sm:hidden" />
        </div>

        <div className="flex flex-col justify-between p-7 sm:p-9">
          <div>
            <p className="text-[10px] uppercase tracking-[.3em] text-[#d6a85f]">
              {cut.service?.name || "Service Look"}
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{cut.name}</h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              {cut.description || cut.service?.description || "Master barbering tailored to your face shape, head structure, and personal style."}
            </p>
            <div className="mt-6 flex justify-between border-y border-white/10 py-4 text-sm">
              <span className="font-bold text-white">{formatPrice(cut.service?.price)}</span>
              <span className="flex items-center gap-1.5 text-white/60">
                <Clock3 size={14} className="text-[#d6a85f]" />
                {/* {formatDuration(cut.service?.duration)} */}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to={`/booking?service=${cut.service?.id || cut.id}`}
              onClick={close}
              className="block  bg-[#d6a85f] px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-black transition hover:bg-[#e5bd7a]"
            >
              Order & Book This Style
            </Link>
            <button
              type="button"
              onClick={close}
              className="block w-full  border border-white/15 px-5 py-3 text-center text-xs font-medium text-white/70 transition hover:bg-white/5 cursor-pointer"
            >
              Back to Styles
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
