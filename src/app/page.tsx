import type { Metadata } from "next";
import { siteOrigin } from "@/lib/site-metadata";

export const metadata: Metadata = {
  alternates: { canonical: siteOrigin, types: { "text/markdown": `${siteOrigin}/markdown/index.md` } },
};

export { default } from "@/components/pages/home-page";
