import { Sparkles, Scissors } from "lucide-react";

/**
 * "What are you after?" — the booking form's shortcut into the catalogue.
 *
 * ## The problem it solves
 *
 * The service `<select>` asks someone to know the shop's vocabulary before
 * they can answer it. Most customers arrive with a description, not a
 * product code: "I want something sharp", "just the beard", "keep my
 * length". Reading nine service names to work out which one that is makes
 * them do the shop's job.
 *
 * So the picker starts from their words and resolves them to the real
 * catalogue, and then gets out of the way. The chips are derived from
 * services the backend actually published, matched by keyword, so this
 * can never offer something the shop does not sell or invent a price for
 * it.
 *
 * ## Why a chip with no match is not rendered
 *
 * An intent that matches nothing would be a button that does nothing
 * visible. Worse than absent: it reads as "we do not do that". So the
 * list is built from the loaded services and a chip only exists when at
 * least one service matches it.
 */

/**
 * Intents, matched against the catalogue.
 *
 * Keywords are checked against a service's name, its description and the
 * names of its styles - a shop that sells "Tapered Low Fade" as a style
 * under another service should still be findable by typing "fade".
 *
 * **Order inside a list is the ranking.** The first keyword found is the
 * answer, so the specific phrases come before the broad words. Counting
 * how many keywords matched, which was the first version, gets this
 * exactly backwards: "Classic Cut" and "Signature Haircut" both match
 * twice, so tapping *Classic cut* landed the customer on Signature —
 * because the shop happened to publish a style called "Classic Side Part".
 * First-match ranking with "classic cut" above "classic" above
 * "signature" sends them to Classic Cut, which is what the chip says.
 *
 * Lists that match nothing are dropped entirely, so a chip can never be a
 * button that quietly does nothing.
 */
const INTENTS = [
  {
    key: "sharp",
    label: "Sharp & clean",
    keywords: ["skin fade", "high fade", "mid fade", "fade", "taper"],
  },
  {
    key: "beard",
    label: "Beard only",
    keywords: ["beard sculpt", "beard trim", "beard"],
  },
  {
    key: "classic",
    label: "Classic cut",
    keywords: ["classic cut", "classic side part", "signature haircut"],
  },
  {
    key: "keep",
    label: "Keep some length",
    keywords: ["textured", "crop", "side part"],
  },
  {
    key: "both",
    label: "Hair & beard",
    keywords: ["haircut + beard", "hair and beard", "full grooming"],
  },
];

/** Everything about a service a customer might describe it with. */
function searchable(service) {
  return [
    service.name,
    service.description,
    ...(service.styles || []).map((style) => style.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Which service best answers each intent.
 *
 * Score is the position of the first keyword the service matched, so
 * lower is a better answer and an unmatched service is simply absent.
 * Ties go to the shop's own order, because the catalogue is curated and
 * its first entry is the one the shop wants pushed.
 *
 * @returns {Array<{key: string, label: string, service: object}>}
 */
function resolveIntents(services) {
  // The haystack is built once per service rather than once per intent:
  // five intents over eight services is forty string joins on a form that
  // re-renders while the availability request is in flight.
  const haystacks = services.map(searchable);

  return INTENTS.map((intent) => {
    let best = null;
    let bestRank = Infinity;

    services.forEach((service, index) => {
      const rank = intent.keywords.findIndex((keyword) =>
        haystacks[index].includes(keyword)
      );

      if (rank !== -1 && rank < bestRank) {
        bestRank = rank;
        best = service;
      }
    });

    return { key: intent.key, label: intent.label, service: best };
  }).filter((entry) => entry.service);
}

const CHIP =
  "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition";

export function NeedPicker({ services = [], selectedId, onPick }) {
  const matches = resolveIntents(services);
  if (!matches.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-white/45">
        <Sparkles className="h-3.5 w-3.5 text-[#d6a85f]" />
        <span>Quick intent · tap to jump to matching service</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {matches.map((item) => {
          const isSelected = selectedId === item.service.id;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onPick(item.service.id)}
              className={`${CHIP} ${
                isSelected
                  ? "border-[#d6a85f] bg-[#d6a85f]/15 text-[#f4f0e8] shadow-[0_0_12px_rgba(214,168,95,0.2)]"
                  : "border-white/10 bg-[#141414] text-white/70 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-white/40">({item.service.name})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StylePicker({ service, selectedName, onSelect }) {
  const styles = service?.styles || [];
  if (!styles.length) return null;

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-[#141414]/80 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-white/70">
        <Scissors className="h-3.5 w-3.5 text-[#d6a85f]" />
        <span>Style variant (optional)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {styles.map((style) => {
          const isSelected = selectedName === style.name;
          return (
            <button
              key={style.id || style.name}
              type="button"
              onClick={() => onSelect(isSelected ? "" : style.name)}
              className={`${CHIP} text-xs ${
                isSelected
                  ? "border-[#d6a85f] bg-[#d6a85f]/20 text-[#f4f0e8]"
                  : "border-white/10 bg-[#1c1c1c] text-white/60 hover:text-white"
              }`}
            >
              {style.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
