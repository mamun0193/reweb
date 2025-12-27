"use client";

import React, { useState } from "react";
import axios from "axios";
import { AnalysisResult } from "../types/analysis";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ImpactCard from "@/components/ImpactCard";
import ResourceCard from "@/components/ResourceCard";
import SuggestionCard from "@/components/SuggestionCard";

export default function AnalyzeUrl() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setData(null);

    try {
      const response = await axios.post("/api/analyze", { url });
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error analyzing URL:", error);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="center text-4xl mt-6 mb-6">Welcome to ReWeb</h1>
      <h2 className="center text-2xl">Measure Your Website’s Environmental Impact</h2>
      <form onSubmit={handleSubmit} className="mt-8 flex">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter your website URL"
          className="border p-2 w-96"
        />
        <button
          type="submit"
          className="hover:bg-green-800 ml-4 p-3 bg-green-700 text-white cursor-pointer rounded-md animate-pulse"
        >
          Analyze
        </button>
      </form>

      <div className="mt-6 w-full max-w-xl space-y-6">
        {loading && (
          <div className="space-y-6 transition-all duration-300">
            <LoadingSkeleton variant="resource" />
            <LoadingSkeleton variant="impact" />
            <LoadingSkeleton variant="suggestion" suggestionsCount={3} />
          </div>
        )}

        {!loading && data && (
          <>
            <ResourceCard data={data} />
            <ImpactCard data={data} />
            <SuggestionCard suggestions={data.suggestions} />
          </>
        )}
      </div>
    </div>
  )
}