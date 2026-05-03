import { Logo } from "../icons/Logo.tsx";

export const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        {/* Logo + description */}
        <div className="flex flex-col items-center justify-center">
          <Logo />
          <p className="text-sm text-gray-400">Más que un vuelo</p>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
            <li className="hover:text-white cursor-pointer">News</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
            <li className="hover:text-white cursor-pointer">Flight status</li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Terms</li>
            <li className="hover:text-white cursor-pointer">Privacy</li>
            <li className="hover:text-white cursor-pointer">Cookies</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 text-center text-sm py-4 text-gray-500">
        © {new Date().getFullYear()} Falcon Airways. All rights reserved.
      </div>
    </footer>
  );
};
