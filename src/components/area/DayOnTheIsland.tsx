import { smart } from "@/components/site/text";
import type { DayEntry } from "@/content/experiences";

/** An unhurried day, hour by hour, as a timetable: time in the margin, the hour beside it. */
export function DayOnTheIsland({ entries }: { entries: DayEntry[] }) {
  return (
    <ol className="border-t border-ink">
      {entries.map((d) => (
        <li
          key={d.time}
          className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-col border-b border-rule py-4 md:grid-cols-[8rem_minmax(0,1fr)] lg:py-5"
        >
          <p className="pt-1 font-sans text-small font-medium tabular">{d.time}</p>
          <div>
            <h3 className="font-serif text-h3 font-light">{smart(d.title)}</h3>
            <p className="mt-1 max-w-measure text-small text-ink-muted">{smart(d.body)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
