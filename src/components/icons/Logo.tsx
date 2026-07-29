import { useNavigate } from "react-router-dom";
import imgLogo from "../../assets/logo/logo.png";

export const Logo = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="flex items-center cursor-pointer bg-transparent border-0"
      onClick={() => navigate("/")}
    >
      <p className="text-3xl font-bold tracking-[.5em]">FALCON</p>
      <img
        src={imgLogo}
        alt="Falcon logo"
        className="h-10 w-auto rounded-xl ml-2"
      />
    </button>
  );
};
