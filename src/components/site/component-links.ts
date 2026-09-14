import navigation from "@/content/_meta";

/** Keep product search destinations aligned with the published docs sidebar. */
export const componentLinks = (() => {
  let isComponentSection = false;
  const links: { name: string; href: string }[] = [];

  for (const [slug, entry] of Object.entries(navigation)) {
    if (typeof entry === "object" && entry.type === "separator") {
      isComponentSection = entry.title !== "Installation";
    } else if (isComponentSection && typeof entry === "string") {
      links.push({ name: entry, href: `/docs/${slug}` });
    }
  }

  return links.sort((a, b) => a.name.localeCompare(b.name));
})();
