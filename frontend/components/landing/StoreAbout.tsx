const FEATURES = [
  { label: "Fresh bakery", description: "Traditional Sangak & Persian breads" },
  { label: "Market", description: "Persian groceries & specialty imports" },
  { label: "Pickup", description: "Order online, pick up in store" },
];

export default function StoreAbout() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
          About this bakery
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-stone-600">
          Gandom is your neighborhood Persian bakery and market, bringing
          freshly baked sangak, barbari, and lavash alongside imported spices,
          rice, dairy, and pantry staples to the Paterson community. Our bakers
          craft bread daily while our market shelves are stocked with the flavors
          of home. Stop in for warm bread from the oven, or browse our full
          selection below and add items to your cart for pickup.
        </p>
        <p className="mt-4 max-w-2xl text-[15px] leading-[1.75] text-stone-600">
          We look forward to bringing joy to your table — whether it&apos;s a
          morning loaf, a weeknight meal, or sweets for guests.
        </p>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          Store features
        </h3>
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.label}
              className="rounded-sm border border-stone-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <p className="font-serif text-lg text-stone-900">{f.label}</p>
              <p className="mt-1 text-sm text-stone-500">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
