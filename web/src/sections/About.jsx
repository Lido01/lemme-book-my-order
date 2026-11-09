import { Clock3, MapPin } from "lucide-react";

import Button from "../components/Button";
import Reveal from "../components/Reveal";
import ParallaxSection from "../components/ParallaxSection";
import { useLanguage } from "../i18n/LanguageContext";
import { studioLocation } from "../data/studioLocation";

export default function About() {
  const { t } = useLanguage();

  return (
    <ParallaxSection
      id="about"
      image="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1920&q=85"
      overlay="from-black/95 via-black/80 to-black/95"
      contentClassName="py-20 sm:py-24"
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-24">
        <Reveal>
          <h2 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.05] sm:text-6xl">
            {t("about.titleLead")}{" "}
            <span className="italic text-[#d6a85f]">{t("about.titleAccent")}</span>
          </h2>
        </Reveal>

        <Reveal delay={120} className="">
          <div className="space-y-4 border-t border-white/15 pt-6 text-sm text-white/80">
            <p className="flex gap-3">
              <MapPin size={18} className="shrink-0" />{" "}
              <span>{studioLocation.address}</span>
            </p>
            <p className="flex gap-3">
              <Clock3 size={18} className="shrink-0" />{" "}
              <span>{studioLocation.hours}</span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              href={studioLocation.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              {t("about.directions")}
            </Button>
            <Button href={studioLocation.phoneHref} variant="ghost">
              {studioLocation.phone}
            </Button>
          </div>
        </Reveal>
      </div>
    </ParallaxSection>
  );
}
