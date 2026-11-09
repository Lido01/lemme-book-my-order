import { Clock3, MapPin, Music2, Send, ShieldCheck, User } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/LanguageContext";
import { studioLocation } from "../data/studioLocation";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#060606] px-5 py-16 text-white sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d6a85f] font-serif text-lg text-black font-bold">
              L
            </span>
            <span className="font-serif text-xl tracking-tight">LX BARBERS</span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-white/40">
            {t("footer.lead")}
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="https://tiktok.com/@tech_focus1"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow on TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-[#d6a85f] hover:text-[#d6a85f]"
            >
              <Music2 size={16} />
            </a>
            <a
              href="https://t.me/techfocus_hub"
              target="_blank"
              rel="noreferrer"
              aria-label="Message on Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-[#d6a85f] hover:text-[#d6a85f]"
            >
              <Send size={16} />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow on Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-sm font-bold text-white/50 transition hover:border-[#d6a85f] hover:text-[#d6a85f]"
            >
              f
            </a>
          </div>
        </div>

        {/* Portals & Accounts */}
        <div className="md:justify-self-center">
          <p className="text-[10px] uppercase tracking-[.25em] text-white/30">
            Portals & Access
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li>
              <Link to="/login" className="flex items-center gap-2 transition hover:text-[#d6a85f]">
                <User size={14} className="text-[#d6a85f]" />
                <span>Customer Sign-in</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className="flex items-center gap-2 transition hover:text-[#d6a85f]">
                <span>Create Customer Account</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="flex items-center gap-2 transition hover:text-[#d6a85f]">
                <ShieldCheck size={14} className="text-[#d6a85f]" />
                <span>Staff & Owner Console</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:justify-self-end">
          <p className="text-[10px] uppercase tracking-[.25em] text-white/30">
            {t("footer.visit")}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/50">
            <li className="flex gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0" />{" "}
              <span>{studioLocation.addressLines.street}, {studioLocation.addressLines.city}</span>
            </li>
            <li className="flex gap-2">
              <Clock3 size={15} className="mt-0.5 shrink-0" />{" "}
              <span>{t("findUs.openDaily")}</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
