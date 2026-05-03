import { DestinationCard } from "./DestinationCard";

import cartagena from "../../assets/destinations/cartagena.jpg";
import medellin from "../../assets/destinations/medellin.jpg";
import sanAndres from "../../assets/destinations/san-andres.jpg";

export const DestinationsSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-24 mb-50">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-6xl font-bold">Destinos destacados</h2>
        <p className="text-gray-500 mt-2 text-lg">
          Explora algunos de los destinos más populares en Colombia
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <DestinationCard city="Cartagena" image={cartagena} />
        </div>

        <DestinationCard city="Medellín" image={medellin} />
        <DestinationCard city="San Andrés" image={sanAndres} />
      </div>
    </section>
  );
};
