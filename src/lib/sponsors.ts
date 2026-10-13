// Kept literal so client components importing tiers don't pull in site-metadata's route map.
const siteOrigin = "https://www.obsidianui.dev";

export type SponsorTierId = "diamond" | "gold";

export type SponsorTier = {
  id: SponsorTierId;
  name: string;
  price: number;
  featured: boolean;
  perks: readonly string[];
  checkoutUrl: string;
};

export const sponsorContact = {
  email: "jadavatharv2010@gmail.com",
  x: "https://x.com/athrix_codes",
  telegram: "https://t.me/athrix",
} as const;

export const sponsorWelcomeRoute = "/sponsors/welcome";

export function sponsorWelcomePath(tier: SponsorTierId) {
  return `${sponsorWelcomeRoute}?${tier}-sponsor`;
}

// Dodo does not echo the product on the return URL, so the tier rides along as a query key.
function dodoCheckoutUrl(productId: string, tier: SponsorTierId) {
  const redirect = `${siteOrigin}${sponsorWelcomePath(tier)}`;
  return `https://checkout.dodopayments.com/buy/${productId}?quantity=1&redirect_url=${encodeURIComponent(redirect)}`;
}

export const sponsorTiers: readonly SponsorTier[] = [
  {
    id: "diamond",
    name: "Diamond",
    price: 200,
    featured: true,
    checkoutUrl: dodoCheckoutUrl("pdt_0NpdpIkVUV6oaqn5ZZOz1", "diamond"),
    perks: [
      "Largest logo on the sponsors page",
      "Largest logo on the home page",
      "Largest logo in the README",
      "Shoutout on X",
      "Direct line for feedback and requests",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 100,
    featured: false,
    checkoutUrl: dodoCheckoutUrl("pdt_0NpdrEl7vU0O0GI3jMmuk", "gold"),
    perks: [
      "Larger logo on the sponsors page",
      "Logo on the home page",
      "Larger logo in the README",
      "Shoutout on X",
    ],
  },
];

// Matching by prefix tolerates a checkout that appends "?status=..." instead of "&status=...".
export function sponsorTierFromQueryKeys(keys: readonly string[]) {
  return sponsorTiers.find(tier => keys.some(key => key.startsWith(`${tier.id}-sponsor`)));
}

export const sponsorAssetChecklist = [
  {
    title: "Your logo",
    detail: "SVG works best. A PNG is fine at 2x on a transparent background, at least 512px wide.",
  },
  {
    title: "Light and dark versions",
    detail: "ObsidianUI runs in both themes. If you only have one version, send it and we will make it work.",
  },
  {
    title: "Where the logo should link",
    detail: "The exact URL, including any UTM tags you want on it.",
  },
  {
    title: "Your name as it should appear",
    detail: "Company or product name, spelled and capitalised the way you want it read.",
  },
  {
    title: "Your X and LinkedIn handles",
    detail: "Used for the sponsor shoutout post.",
  },
] as const;
