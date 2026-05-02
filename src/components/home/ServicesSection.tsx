import { ServiceCard } from "./ServiceCard";

export const ServicesSection = () => {
    return (
        <section className="max-w-6xl mx-auto px-4 mt-36 grid md:grid-cols-2 gap-6">

            <ServiceCard
                title="Check-in"
                description="Listo para el despegue? Completa tu check-in digital."
                action="Realizar Check-in"
                dark
            />

            <ServiceCard
                title="Gestionar Reserva"
                description="Consulta o modifica tu reserva, actualiza información de pasajeros, y accede a tu itinerario."
                action="Gestionar Reserva"
            />

        </section>
    );
};