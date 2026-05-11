import imgLogo from "../../assets/logo/logo.jpg";

export const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <div className="relative w-32 h-32">
        {/* Animated outer circle */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />

        {/* Logo container with fill animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24 overflow-hidden rounded-xl">
            {/* Base logo */}
            <img
              src={imgLogo}
              alt="Falcon logo"
              className="w-full h-full object-cover"
            />

            {/* Animated fill effect */}
            <div
              className="absolute inset-0 bg-blue-600 opacity-30 animate-pulse"
              style={{
                animation: "fillAnimation 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Loading text with animation */}
      <div className="flex items-center gap-1">
        <p className="text-lg font-semibold text-gray-700">Cargando</p>
        <div className="flex gap-1">
          <span
            className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fillAnimation {
          0%, 100% {
            opacity: 0.1;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.4;
            transform: scaleY(1.1);
          }
        }
      `}</style>
    </div>
  );
};
