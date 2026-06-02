"use client";

import Image from "next/image";
import { useState } from "react";

const PRIMARY = "/images/AAF70FD6-8487-4058-A663-E0F99657FDA5.jpeg";
const FALLBACK = "/images/bakery.jpeg";

export default function StoreHero() {
  const [src, setSrc] = useState(PRIMARY);

  return (
    <div className="relative mt-4 w-full overflow-hidden bg-stone-200">
      <div className="relative mx-auto aspect-[21/9] max-h-[420px] w-full max-w-6xl sm:aspect-[2.4/1]">
        <Image
          src={src}
          alt="Gandom Bakery storefront — Sangak bread and Persian market"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1152px"
          className="object-cover object-center"
          onError={() => {
            if (src !== FALLBACK) setSrc(FALLBACK);
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#faf8f5]/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>
    </div>
  );
}
