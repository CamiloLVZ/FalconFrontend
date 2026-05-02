interface Props {
    title: string;
    description: string;
    action: string;
    dark?: boolean;
}

export const ServiceCard = ({title, description, action, dark = false,}: Props) => {
    return (
        <div
            className={`rounded-2xl p-6 transition shadow-sm hover:shadow-md cursor-pointer
        ${dark ? "bg-blue-950 text-white" : "bg-gray-300"}
      `}
        >

            <h3 className="text-xl font-semibold mb-3">
                {title}
            </h3>

            <p className={`text-sm mb-6 ${dark ? "text-gray-300" : "text-gray-500"}`}>
                {description}
            </p>

            <button className="text-sm font-medium hover:underline cursor-pointer">
                {action} →
            </button>
        </div>
    );
};