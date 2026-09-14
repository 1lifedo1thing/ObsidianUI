import { HeroSection } from "@/components/landing/herosection";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { TestimonialsMarquee } from "@/components/landing/testimonials-marquee";
import { VideoShowcaseGrid } from "@/components/landing/video-showcase-grid";
import { SmoothScroll } from "@/components/block/smooth-scroll";
import { MobileNotification } from "@/components/landing/mobile-notification";

const Page = () => {
    return (
        <div className="landing-typography">
            <MobileNotification />
            <SmoothScroll>
                <main id="main-content" className="overflow-hidden noScrollbar">
                    <HeroSection />

                    {/* Featured videos and interactive effects */}
                    <VideoShowcaseGrid />

                    <TestimonialsMarquee />

                    <LandingFAQ />
                </main>
            </SmoothScroll>
        </div>
    );
};

export default Page;
