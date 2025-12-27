import React from "react";
import Row from "./Row";
import { AnalysisResult } from "@/app/types/analysis";


const ImpactCard = ({ data }: { data: AnalysisResult }) => {
    return (
        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-4">🌱 Environmental Impact</h2>

            <div className="space-y-3 text-sm">
                <Row label="Energy Used" value={`${data.impacts.energyWH} Wh`} />
                <Row label="Carbon Emitted" value={`${data.impacts.carbon} g CO₂`} />
                <Row label="Water Consumed" value={`${data.impacts.water} L`} />
            </div>
        </div>
    );
};
export default ImpactCard;