import type { CSSProperties } from "react";
import Link from "next/link";
import { Check, Mail, Send } from "lucide-react";
import { XLogo } from "@/components/site/x-logo";
import { RaisedButton } from "@/components/ui/raised-button";
import { sponsorAssetChecklist, sponsorContact, type SponsorTier } from "@/lib/sponsors";
import "./sponsor-thank-you-page.css";

function ContactActions({ subject }: { subject: string }) {
  return (
    <div className="obsidianui-thanks-actions">
      <RaisedButton asChild color="#000000" size="lg" className="obsidianui-thanks-primary no-underline rounded-xl before:rounded-xl">
        <a href={`mailto:${sponsorContact.email}?subject=${encodeURIComponent(subject)}`}>
          <Mail aria-hidden="true" />
          Email your assets
        </a>
      </RaisedButton>
      <a className="obsidianui-thanks-secondary" href={sponsorContact.x} target="_blank" rel="noreferrer">
        <XLogo />
        DM on X
      </a>
      <a className="obsidianui-thanks-secondary" href={sponsorContact.telegram} target="_blank" rel="noreferrer">
        <Send aria-hidden="true" />
        Telegram
      </a>
    </div>
  );
}

// Dodo appends the payment status to redirect_url; anything else is treated as a completed checkout.
export function isFailedCheckout(status: string | string[] | undefined) {
  return status === "failed" || status === "cancelled";
}

export default function SponsorThankYouPage({ tier, failed }: { tier: SponsorTier; failed: boolean }) {

  if (failed) {
    return (
      <main id="main-content" className="obsidianui-thanks">
        <section className="obsidianui-thanks-hero">
          <h1>Your payment didn’t go through</h1>
          <p>
            Nothing was charged. You can try checkout again, or message me and we will sort it out together.
          </p>
          <div className="obsidianui-thanks-actions">
            <RaisedButton asChild color="#000000" size="lg" className="obsidianui-thanks-primary no-underline rounded-xl before:rounded-xl">
              <a href={tier.checkoutUrl}>Try again</a>
            </RaisedButton>
            <a className="obsidianui-thanks-secondary" href={`mailto:${sponsorContact.email}?subject=${encodeURIComponent("ObsidianUI sponsorship payment")}`}>
              <Mail aria-hidden="true" />
              Email me
            </a>
          </div>
        </section>
      </main>
    );
  }

  const steps = [
    { title: "Sponsors page", detail: `You picked ${tier.name}`, state: "done" },
    { title: "Dodo checkout", detail: "Payment confirmed", state: "done" },
    { title: "Send your assets", detail: "Email or DM what’s listed below", state: "current" },
    { title: "Sponsor placement", detail: "Your logo and link go live on the site", state: "next" },
  ] as const;

  return (
    <main id="main-content" className="obsidianui-thanks">
      <section className="obsidianui-thanks-hero">
        <span className="obsidianui-thanks-badge" aria-hidden="true">
          <Check strokeWidth={2.5} />
        </span>
        <h1>Welcome, {tier.name} sponsor. Thank you.</h1>
        <p>
          Your payment went through and Dodo Payments has emailed your receipt. Sponsors are what keep ObsidianUI
          free and open source.
        </p>

        <ol className="obsidianui-thanks-steps" aria-label="Sponsorship progress">
          {steps.map((step, index) => (
            <li
              key={step.title}
              data-state={step.state}
              aria-current={step.state === "current" ? "step" : undefined}
              style={{ "--i": index } as CSSProperties}
            >
              <span className="obsidianui-thanks-step-marker" aria-hidden="true">
                {step.state === "done" ? <Check strokeWidth={2.5} /> : index + 1}
              </span>
              <span className="obsidianui-thanks-step-text">
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="obsidianui-thanks-section" aria-labelledby="sponsor-assets-title">
        <div className="obsidianui-thanks-heading">
          <h2 id="sponsor-assets-title">What I need from you</h2>
          <p>Send these by email, X, or Telegram and I’ll add your placement by hand.</p>
        </div>

        <ol className="obsidianui-thanks-checklist">
          {sponsorAssetChecklist.map((item, index) => (
            <li key={item.title}>
              <span className="obsidianui-thanks-step-marker" aria-hidden="true">{index + 1}</span>
              <span className="obsidianui-thanks-step-text">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <ContactActions subject={`ObsidianUI ${tier.name} sponsorship assets`} />
      </section>

      <section className="obsidianui-thanks-note">
        <p>
          Your subscription renews monthly until you cancel. You can cancel or update your card from the billing portal
          link in your Dodo Payments receipt, and your placement stays live until the end of the period you have paid
          for.
        </p>
        <p>
          Anything at all, reply to your receipt, email{" "}
          <a href={`mailto:${sponsorContact.email}`}>{sponsorContact.email}</a>, or message me on{" "}
          <a href={sponsorContact.x} target="_blank" rel="noreferrer">X</a> or{" "}
          <a href={sponsorContact.telegram} target="_blank" rel="noreferrer">Telegram</a>. The full terms are on the{" "}
          <Link href="/terms">Terms of Service</Link> page.
        </p>
      </section>
    </main>
  );
}
