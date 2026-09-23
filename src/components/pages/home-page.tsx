import { HeroSection } from "@/components/landing/herosection";
import { PlatformSponsors } from "@/components/landing/platform-sponsors";
import { TestimonialsMarquee } from "@/components/landing/testimonials-marquee";
import { VideoShowcaseGrid } from "@/components/landing/video-showcase-grid";
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

                {/* Featured videos and interactive effects */}
                <VideoShowcaseGrid />

                <TestimonialsMarquee />

                <PlatformSponsors />
            </main>
        </div>
    );
};

export default Page;
