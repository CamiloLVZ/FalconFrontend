import imgLogo from "../../assets/logo/logo.jpg";

export const Logo = () =>{
    return(<div className="flex items-center cursor-pointer" onClick={()=> {}}>
        <p className="text-3xl font-bold tracking-[.5em]">FALCON</p>
        <img
            src={imgLogo}
            alt="Falcon logo"
            className="h-10 w-auto rounded-xl ml-2"
        />

    </div>);
}