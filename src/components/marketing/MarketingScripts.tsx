"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function MarketingScripts() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll-Reveal: sofort sichtbar wenn im Viewport, sonst IntersectionObserver
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05 }
    );
    // Elemente die beim Laden bereits im Viewport sind sofort einblenden
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add("visible");
      } else {
        observer.observe(el);
      }
    });

    // Hero Slider wird vollständig durch CSS @keyframes gesteuert
    // kein JavaScript nötig

    // Hero Partikel
    const particleContainer = document.querySelector(".hero__particles");
    if (particleContainer) {
      particleContainer.innerHTML = "";
      for (let i = 0; i < 40; i++) {
        const p = document.createElement("span");
        p.className = "hero__particle";
        const size = 2 + Math.random() * 3;
        p.style.left = Math.random() * 100 + "%";
        p.style.bottom = -(Math.random() * 30) + "%";
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.animationDuration = 10 + Math.random() * 15 + "s";
        p.style.animationDelay = Math.random() * 12 + "s";
        if (Math.random() > 0.7)
          p.style.background = "rgba(255,255,255,.3)";
        particleContainer.appendChild(p);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
