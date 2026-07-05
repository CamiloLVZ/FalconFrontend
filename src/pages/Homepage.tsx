import {HeroSection} from "../components/features/home/HeroSection.tsx";
import {ServicesSection} from "../components/features/home/ServicesSection.tsx";
import {DestinationsSection} from "../components/features/home/DestinationsSection.tsx";

export const HomePage = () => {
    return (
        <div>
            <HeroSection />
            <ServicesSection />
            <DestinationsSection />
        </div>
    );
};