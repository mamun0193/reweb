// Build suggestion objects to match the API's `AnalysisResult.suggestions` shape
export type Suggestion = {
    id: string;
    message: string;
    severity: "low" | "medium" | "high";
}

export function generateSuggestions(analysis: { pageSizeMB: number; resources: any; impacts: any }): Suggestion[] {
    const suggestions: Suggestion[] = [];

    const { pageSizeMB, resources, impacts } = analysis;

    const push = (message: string, severity: Suggestion["severity"]) => {
        suggestions.push({ id: `${suggestions.length + 1}`, message, severity });
    };

    if (pageSizeMB > 5) {
        push("Large Page Size: consider optimizing assets and reducing the number of resources.", "medium");
    }

    if (resources.apiCalls > 15) {
        push("Excessive API Calls: reduce or combine API requests.", "medium");
    }

    if (resources.thirdPartyAPICalls > 50) {
        push("High third-party API usage: limit external requests to improve performance.", "high");
    }

    if (resources.js > 2000) {
        push("Large JavaScript payload: use code-splitting and remove unused libraries.", "medium");
    }

    if (resources.image > 3000) {
        push("Large image payload: optimize images to reduce load times.", "high");
    }

    if (impacts.carbon > 1) {
        push("High carbon impact: optimize resources to reduce energy consumption.", "high");
    }

    if (impacts.water > 1) {
        push("High water usage: optimize resource usage to minimize environmental impact.", "medium");
    }

    if (impacts.energyWH > 50) {
        push("High energy consumption: optimize code and resources.", "high");
    }

    if (suggestions.length === 0) {
        push("Good Job! Your website is well optimized with no significant issues detected.", "low");
    }
    return suggestions;
}