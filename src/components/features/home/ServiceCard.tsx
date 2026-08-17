import { Link } from "react-router-dom";

interface Props {
    title: string;
    description: string;
    action: string;
    dark?: boolean;
    to?: string;
    onClick?: () => void;
}

export const ServiceCard = ({
    title,
    description,
    action,
    dark = false,
    to,
    onClick,
}: Props) => {
    const cardContent = (
        <div
            onClick={onClick}
            className={`rounded-2xl p-6 transition shadow-sm hover:shadow-md cursor-pointer h-full flex flex-col justify-between
        ${dark ? "bg-blue-950 text-white hover:bg-blue-900" : "bg-gray-300 hover:bg-gray-200 text-gray-900"}
      `}
        >
            <div>
                <h3 className="text-xl font-semibold mb-3">
                    {title}
                </h3>

                <p className={`text-sm mb-6 ${dark ? "text-gray-300" : "text-gray-600"}`}>
                    {description}
                </p>
            </div>

            <span className="text-sm font-medium hover:underline inline-flex items-center gap-1">
                {action} →
            </span>
        </div>
    );

    if (to) {
        return (
            <Link to={to} className="block h-full no-underline">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
};