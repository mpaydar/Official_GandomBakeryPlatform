"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import { useCart } from "@/lib/CartContext";

type BreadKey = "sangak" | "taftoon";

const BREADS: Record<BreadKey, {
  name: string;
  description: string;
  detail: string;
  photo: string;
  unitPrice: number;
  badge: string;
  ring: string;
}> = {
  sangak: {
    name: "Sangak",
    photo: "/images/sangak2.jpg",
    description: "Traditional stone-baked flatbread",
    detail: "Cooked on a bed of hot pebbles — crispy, chewy, and full of flavour.",
    unitPrice: 3.99,
    badge: "bg-amber-500 text-amber-950",
    ring: "hover:ring-amber-400/60",
  },
  taftoon: {
    name: "Taftoon",
    photo: "/images/taftoon.jpeg",
    description: "Soft, thin round flatbread",
    detail: "Light and pillowy with a gentle char — perfect with cheese or jam.",
    unitPrice: 2.99,
    badge: "bg-orange-500 text-orange-950",
    ring: "hover:ring-orange-400/60",
  },
};

function BreadCard({ breadKey }: { breadKey: BreadKey }) {
  const b = BREADS[breadKey];
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ itemType: breadKey, name: b.name, quantity: qty, unitPrice: b.unitPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl ring-2 ring-transparent transition-all duration-300 ${b.ring}`}>
      {/* Photo */}
      <div className="relative h-48 w-full shrink-0 sm:h-52">
        <Image src={b.photo} alt={b.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${b.badge}`}>{b.name}</span>
          <span className="text-sm font-bold text-amber-300">${b.unitPrice.toFixed(2)} each</span>
        </div>
        <h2 className="text-xl font-bold text-white">{b.name}</h2>
        <p className="mt-1 text-sm text-slate-300/70">{b.description}</p>
        <p className="mt-1 text-xs text-slate-500">{b.detail}</p>

        {/* Quantity stepper */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-xl font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200 active:scale-95"
          >
            −
          </button>
          <span className="flex-1 text-center text-2xl font-bold text-amber-100">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/60 text-xl font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200 active:scale-95"
          >
            +
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all duration-200 active:scale-95 ${
            added ? "bg-green-500 text-white" : "bg-amber-500 text-slate-900 hover:bg-amber-400"
          }`}
        >
          {added ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
              Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BakeryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900">
      <div className="w-full bg-slate-900/80 px-4 py-3 backdrop-blur sm:px-6">
        <Header />
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-amber-100 sm:text-4xl">
          Select your bread
        </h1>
        <p className="mb-10 text-center text-sm text-slate-400">
          Add items to your cart, then checkout when ready
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7">
          <BreadCard breadKey="sangak" />
          <BreadCard breadKey="taftoon" />
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-6 py-3 text-sm font-bold text-amber-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            View cart & checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
