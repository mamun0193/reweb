import React from "react";

type Suggestion = {
    id: string;
    message: string;
    severity: "low" | "medium" | "high";
};

type Props = {
    suggestions: Suggestion[];
};

export default function SuggestionCard({ suggestions }: Props) {
    return (
        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Suggestions</h2>

            <div className="space-y-3">
                {suggestions.map((item, index) => (
                    <div
                        key={index}
                        className={`border-l-4 p-3 rounded ${item.severity === "high"
                            ? "border-red-500"
                            : item.severity === "medium"
                                ? "border-yellow-500"
                                : "border-green-500"}`} title={`Severity: ${item.severity}`}>   {`Severity: ${item.severity
                                    }`}
                        <p className="font-medium">{item.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
