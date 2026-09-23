"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./testimonials-marquee.css";

// Illustrative copy for the design; replace with permissioned customer quotes.
const testimonials = [
  { name: "Alex Rivera", role: "Frontend developer", quote: "ObsidianUI brings the little details together. I can start with a component, make it my own, and keep the rest of my project moving." },
  { name: "Jordan Lee", role: "Product designer", quote: "The motion is what caught my eye. The source code is what made me stay. It is so much easier to take an idea from a sketch to a working interface." },
  { name: "Casey Morgan", role: "Independent maker", quote: "I want to build my product, not rebuild every interaction. ObsidianUI gives me a starting point that still feels like something I can own." },
  { name: "Taylor Quinn", role: "Design engineer", quote: "A small hover effect can change the feel of a whole page. These are the kinds of details I love bringing into the things I build." },
  { name: "Sam Ellis", role: "React developer", quote: "Preview it, read the code, and try it in the project. That simple flow makes exploring ObsidianUI feel like part of the creative process." },
  { name: "Avery Stone", role: "Creative developer", quote: "The cursor and scroll effects are a lovely starting point for a more expressive site. There is room to experiment without starting from zero." },
  { name: "Riley Park", role: "UI designer", quote: "Thoughtful motion, clean type, and components I can customize. ObsidianUI fits the way I like to work: explore a little, then make it my own." },
  { name: "Morgan Reed", role: "Full-stack developer", quote: "Having the component code right there makes all the difference. I can adjust the styling and behavior to fit the interface I am actually shipping." },
] as const;

type Testimonial = (typeof testimonials)[number];
const rows = [testimonials.slice(0, 4), testimonials.slice(4)];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li className="testimonial-card">
      <figure className="flex h-full flex-col justify-between gap-6">
        <blockquote className="text-pretty text-base font-medium leading-6 text-foreground sm:text-sm sm:leading-5">
          <p>{testimonial.quote}</p>
        </blockquote>
        <figcaption className="flex items-center gap-2.5">
          <Avatar className="size-9 bg-muted ring-1 ring-border/40">
            <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(testimonial.name)}`} alt="" loading="lazy" />
            <AvatarFallback className="text-xs text-muted-foreground">
              {testimonial.name.split(" ").map(part => part[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-sm">
            <p className="font-normal text-foreground/75">{testimonial.name}</p>
            <p className="text-muted-foreground">{testimonial.role}</p>
          </div>
        </figcaption>
      </figure>
    </li>
  );
}

export function TestimonialsMarquee() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="testimonials-section py-16 sm:py-20" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <h2 id="testimonials-title" className="landing-title text-balance text-xl font-semibold sm:text-2xl">
          Made for people who love building.
        </h2>
        <p className="landing-copy mt-3 max-w-[65ch] text-base sm:text-sm">
          A few ways ObsidianUI can become part of your next great interface.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 md:px-8 lg:px-16">
        <div
          ref={viewportRef}
          className="testimonials-marquee rounded-lg"
          data-running={inView && reducedMotion === false}
          data-reduced-motion={reducedMotion === true}
          role="group"
          aria-label="ObsidianUI testimonials"
        >
          {rows.map((row, rowIndex) => (
            <div
              className="testimonials-row rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
              key={rowIndex}
              tabIndex={0}
              role="group"
              aria-label={`Testimonials row ${rowIndex + 1}. Hover or focus to pause this row.`}
            >
              <div className="testimonials-track">
                {[false, true].map(duplicate => (
                  <ul
                    key={String(duplicate)}
                    role="list"
                    className="testimonials-set"
                    aria-hidden={duplicate || undefined}
                    inert={duplicate || undefined}
                  >
                    {row.map(testimonial => <TestimonialCard key={testimonial.name} testimonial={testimonial} />)}
                  </ul>
                ))}
              </div>
            </div>
          ))}
          <div className="testimonials-edge testimonials-edge-left" aria-hidden="true" />
          <div className="testimonials-edge testimonials-edge-right" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
