import React from "react";

type Variant = "impact" | "resource" | "suggestion";

type Props = {
  variant?: Variant;
  suggestionsCount?: number;
};

export default function LoadingSkeleton({ variant = "impact", suggestionsCount = 3 }: Props) {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg w-full max-w-xl animate-pulse">
      <div className="mb-4">
        <div className="h-6 bg-gray-700 rounded w-1/3" />
      </div>

      {variant === "impact" && (
        <div className="space-y-3 text-sm">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-700 rounded w-1/6" />
            </div>
          ))}
        </div>
      )}

      {variant === "resource" && (
        <div className="space-y-2 text-sm">
          {["", "", "", "", "", "", ""].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-2/3" />
              <div className="h-4 bg-gray-700 rounded w-1/6" />
            </div>
          ))}
        </div>
      )}

      {variant === "suggestion" && (
        <div className="space-y-3">
          {Array.from({ length: suggestionsCount }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-10 w-1.5 bg-gray-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
