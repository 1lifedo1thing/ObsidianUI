import { HeroSection } from "@/components/landing/herosection";
import { PlatformSponsors } from "@/components/landing/platform-sponsors";
import { TestimonialsMarquee } from "@/components/landing/testimonials-marquee";
import { ComponentsShowcase } from "@/components/landing/components-showcase";
import { MobileNotification } from "@/components/landing/mobile-notification";
import { siteAnnouncement } from "@/lib/site-announcement";

const Page = () => {
    return (
        <div className="landing-typography">
            <MobileNotification />
            <main id="main-content" className="overflow-hidden noScrollbar">
                <span className="sr-only">Platform Partners - Vercel [ Hosting Sponsor ] &amp; Tracwell [Analytics Sponsor ]</span>
                <p className="sr-only">{siteAnnouncement}</p>
                <HeroSection />

                <ComponentsShowcase />

                <TestimonialsMarquee />

                <PlatformSponsors />
            </main>
        </div>
    );
};

export default Page;
