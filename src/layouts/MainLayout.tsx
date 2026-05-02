import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

interface Props {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: Props) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
};