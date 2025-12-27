export interface AnalysisResult {
    resources: {
        requestCount: number;
        totalBytes: number;
        html: number;
        css: number;
        js: number;
        image: number;
        apiCalls: number;
        apiBytes: number;
        thirdPartyAPICalls: number;
        thirdPartyAPIBytes: number;
    };
    impacts: {
        energyWH: number;
        carbon: number;
        water: number;
    };
    suggestions: {
        id: string;
        message: string;
        severity: "low" | "medium" | "high";
    }[];
    url: string;
    pageSizeMB: number;
}