export default function Card({ title, children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}>
            <h2 className="text-2xl font-bold text-blue-700 mb-4 pb-3 border-b border-gray-200">
                {title}
            </h2>
            {children}
        </div>
    )
}