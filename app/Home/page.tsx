"use client";

import React, { useState } from "react";
import axios from "axios";

export default function AnalyzeUrl() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/analyze", { url });
      setData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error analyzing URL:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="center text-4xl">Welcome to ReWeb</h1>
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
          className="ml-4 p-2 bg-blue-500 text-white"
        >
          Analyze
        </button>
      </form>

      {data && (
        <div className="mt-6 p-4 border rounded bg-gray-100 w-96">
          <h3 className="text-xl font-bold">Analysis Result:</h3>
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}