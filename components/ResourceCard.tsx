import React from "react";
import Row from "./Row";
import { AnalysisResult } from "@/app/types/analysis";

const ResourceCard = ({ data }: { data: AnalysisResult }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-4">📦 Page Resource Breakdown</h2>

      <div className="space-y-2 text-sm">
        <Row label="HTML" value={`${data.resources.html} KB`} />
        <Row label="CSS" value={`${data.resources.css} KB`} />
        <Row label="JavaScript" value={`${data.resources.js} KB`} />
        <Row label="Images/Videos" value={`${data.resources.image} KB`} />
        <Row label="API Calls" value={data.resources.apiCalls} />
        <Row label="3rd Party Requests" value={data.resources.thirdPartyAPICalls} />
        <Row label="Total Page Size" value={`${data.pageSizeMB} MB`} />
      </div>
    </div>
  );
};
export default ResourceCard;