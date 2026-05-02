import bgImage from "../../assets/backgrounds/sky-background.png";
import {SearchBar} from "../search/SearchBar.tsx";

export const HeroSection = () => {
    return (
        <section className="relative w-full h-[450px] md:h-[550px] lg:h-[650px] overflow-hidden">

            {/* Background image */}
            <img
                src={bgImage}
                alt="Sky background"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Fade inferior suave */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-b from-transparent via-white/50 to-white/99"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 gap-8">
                <div>
                    <h1 className="text-8xl font-bold text-white">
                        Fly whithout{" "}
                        <span className="text-yellow-400">limits</span>
                    </h1>

                    <p className=" mt-4 text-gray-200 mx-auto text-lg">
                        Experience the art of flight. Redefining luxury travel with precision,
                        elegance, and infinite clarity.
                    </p>
                </div>
                {/* Search bar */}
                <div className="w-full max-w-4xl mt-6">
                    <SearchBar onSearch={(filters) => console.log(filters)} />
                </div>
            </div>
        </section>
    );
};