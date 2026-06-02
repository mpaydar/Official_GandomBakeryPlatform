import Link from "next/link";

const HOURS = [
  { day: "Monday", hours: "7:00 AM – 9:00 PM" },
  { day: "Tuesday", hours: "7:00 AM – 9:00 PM" },
  { day: "Wednesday", hours: "7:00 AM – 9:00 PM" },
  { day: "Thursday", hours: "7:00 AM – 9:00 PM" },
  { day: "Friday", hours: "7:00 AM – 9:00 PM" },
  { day: "Saturday", hours: "7:00 AM – 9:00 PM" },
  { day: "Sunday", hours: "7:00 AM – 9:00 PM" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl text-stone-900 sm:text-[1.35rem]">
      {children}
    </h2>
  );
}

export default function StoreSidebar() {
  return (
    <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
      <div>
        <SectionTitle>Location</SectionTitle>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
          949 Main St
          <br />
          Paterson, NJ 07503
        </p>
        <a
          href="https://maps.google.com/?q=949+Main+St+Paterson+NJ+07503"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--landing-accent)] hover:underline"
        >
          Get directions
        </a>
      </div>

      <div>
        <SectionTitle>Contact</SectionTitle>
        <p className="mt-3">
          <a
            href="tel:+19739385542"
            className="text-[15px] text-stone-700 transition hover:text-[var(--landing-accent)]"
          >
            (973) 938-5542
          </a>
        </p>
        <Link
          href="/contact"
          className="mt-3 inline-block text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--landing-accent)] hover:underline"
        >
          Visit us
        </Link>
      </div>

      <div>
        <SectionTitle>Store hours</SectionTitle>
        <dl className="mt-4 space-y-2">
          {HOURS.map(({ day, hours }) => (
            <div
              key={day}
              className="flex justify-between gap-4 border-b border-stone-100 py-2 text-[14px] last:border-0"
            >
              <dt className="text-stone-500">{day}</dt>
              <dd className="font-medium tabular-nums text-stone-800">{hours}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/bakery"
          className="flex items-center justify-center rounded-sm bg-[var(--landing-accent)] px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--landing-accent-hover)]"
        >
          Order fresh bread
        </Link>
        <Link
          href="/checkout"
          className="flex items-center justify-center rounded-sm border border-stone-300 bg-white px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-stone-800 transition hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)]"
        >
          View cart
        </Link>
      </div>
    </aside>
  );
}
