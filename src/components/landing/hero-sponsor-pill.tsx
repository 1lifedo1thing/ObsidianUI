import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import "./hero-sponsor-pill.css";

export function HeroSponsorPill({
  className,
  href = "/sponsors",
  text,
  size = "default",
}: {
  className?: string;
  href?: string;
  /** Replaces the "Backed by | Sponsor" pair with a single line. */
  text?: string;
  size?: "default" | "sm";
}) {
  return (
    <Link
      href={href}
      aria-label={text ?? "Backed by Sponsor, become a sponsor"}
      data-size={size}
      className={["hero-sponsor", className].filter(Boolean).join(" ")}
    >
      {text ? (
        <span className="hero-sponsor-name hero-sponsor-text">{text}</span>
      ) : (
        <>
          <span className="hero-sponsor-label">Backed by</span>
          <span className="hero-sponsor-divider" aria-hidden="true" />
          <span className="hero-sponsor-name">Sponsor</span>
        </>
      )}
      <span className="hero-sponsor-arrow" aria-hidden="true">
        <ArrowUpRight className="hero-sponsor-arrow-out" strokeWidth={2} />
        <ArrowUpRight className="hero-sponsor-arrow-in" strokeWidth={2} />
      </span>
    </Link>
  );
}
