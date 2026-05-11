interface Props {
    city: string;
    image: string;
}

export const DestinationCard = ({ city, image }: Props) => {
    return (
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer">

            {/* Imagen */}
            <img
                src={image}
                alt={city}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>

            {/* Texto */}
            <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-semibold">{city}</h3>
            </div>
        </div>
    );
};