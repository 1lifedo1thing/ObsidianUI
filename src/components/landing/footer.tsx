"use client";
import { r2 } from "@/lib/r2";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { VisitorCount } from "@/components/block/visitor-count";
import "./footer.css";

const repository = "https://github.com/Atharvsinh-codez/ObsidianUI";

const columns = [
  {
    title: "Product",
    links: [
      { title: "Components", href: "/components" },
      { title: "Templates", href: "/templates" },
      { title: "Documentation", href: "/docs/installation" },
      { title: "Developers", href: "/developers" },
      { title: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Socials",
    links: [
      { title: "X / Twitter", href: "https://x.com/athrix_codes" },
      { title: "GitHub", href: repository },
    ],
  },
  {
    title: "Open Source",
    links: [
      { title: "Source code", href: repository },
      { title: "MIT license", href: `${repository}/blob/main/LICENSE` },
      { title: "Report an issue", href: `${repository}/issues` },
    ],
  },
  {
    title: "Get started",
    links: [
      { title: "Browse components", href: "/components" },
      { title: "Installation", href: "/docs/installation" },
      { title: "CLI", href: "/docs/cli" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/docs" || pathname.startsWith("/docs/")) return null;

  return (
    <footer className="site-footer landing-typography">
      <div className="site-footer-inner">
        <div className="site-footer-main">
          <div className="site-footer-brand">
            <Link href="/" className="site-footer-logo" aria-label="ObsidianUI home">
              <Image src={r2("/logo/bg-less.png")} width={28} height={28} alt="" />
              <span>ObsidianUI</span>
            </Link>
            <p className="site-footer-copyright">
              © {new Date().getFullYear()} ObsidianUI. Make every detail count.
            </p>
            <a className="site-footer-credit" href="https://athrix.me" target="_blank" rel="noopener noreferrer">
              Built by Atharv
            </a>
            <VisitorCount className="site-footer-visitors bg-transparent p-0" />
          </div>

          <nav className="site-footer-columns" aria-label="Footer">
            {columns.map(column => (
              <div className="site-footer-column" key={column.title}>
                <h2>{column.title}</h2>
                <ul>
                  {column.links.map(link => {
                    const external = link.href.startsWith("https://");
                    return (
                      <li key={link.title}>
                        <Link
                          href={link.href}
                          prefetch={false}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                        >
                          {link.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="site-footer-wordmark" aria-hidden="true">
          ObsidianUI
        </div>
      </div>
    </footer>
  );
}
