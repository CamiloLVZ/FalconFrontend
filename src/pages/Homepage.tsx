import {HeroSection} from "../components/home/HeroSection.tsx";
import {ServicesSection} from "../components/home/ServicesSection.tsx";
import {DestinationsSection} from "../components/home/DestinationsSection.tsx";

export const HomePage = () => {
    return (
        <div>
            <HeroSection />
            <ServicesSection />
            <DestinationsSection />
        </div>
    );
};