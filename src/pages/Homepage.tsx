import {HeroSection} from "../components/home/HeroSection.tsx";
import {ServicesSection} from "../components/home/ServicesSection.tsx";
import {DestinationsSection} from "../components/DestinationsSection.tsx";
import {NewsletterSection} from "../components/NewsletterSection.tsx";

export const HomePage = () => {
    return (
        <div>
            <HeroSection />
            <ServicesSection />
            <DestinationsSection />
            <NewsletterSection />
        </div>
    );
};