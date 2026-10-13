import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SponsorThankYouPage, { isFailedCheckout } from "@/components/pages/sponsor-thank-you-page";
import { sponsorTierFromQueryKeys, sponsorWelcomeRoute } from "@/lib/sponsors";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const tier = sponsorTierFromQueryKeys(Object.keys(await searchParams));
  const name = tier?.name ?? "sponsor";
  return {
    title: tier ? `Welcome, ${name} sponsor | ObsidianUI` : "Welcome, sponsor | ObsidianUI",
    description: `Your ObsidianUI ${tier ? `${name} ` : ""}sponsorship is confirmed. Here is what we need to get your logo live.`,
    alternates: { canonical: sponsorWelcomeRoute },
    robots: { index: false, follow: false },
  };
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tier = sponsorTierFromQueryKeys(Object.keys(params));
  if (!tier) redirect("/sponsors#tiers");
  return <SponsorThankYouPage tier={tier} failed={isFailedCheckout(params.status)} />;
}
