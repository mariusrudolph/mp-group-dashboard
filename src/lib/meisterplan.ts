// lib/meisterplan.ts
export const mp = {
    baseUrl: process.env.MEISTERPLAN_BASE_URL!,
    token: process.env.MEISTERPLAN_TOKEN!,
    system: process.env.MEISTERPLAN_SYSTEM!,
};

export function mpHeaders() {
    return {
        "Authorization": mp.token,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Meisterplan-Dashboard/1.0.0",
    } as const;
}

export async function mpFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(`${mp.baseUrl}${path}`, {
        ...init,
        headers: { ...mpHeaders(), ...(init.headers || {}) },
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Meisterplan API ${res.status}: ${text}`);
    }
    return res.json();
}

// Reporting API Endpunkte
const REPORTING_API_BASE_URL = "https://api-reporting.eu.meisterplan.com/v1";

export const reportingApi = {
    // Basis-URL für Reporting API (EU)
    baseUrl: REPORTING_API_BASE_URL,

    // Projekte mit Custom Fields laden
    projects: (params: {
        portfolio?: string;
        scenarios?: string;
        startDate?: string;
        finishDate?: string;
        fields?: string[];
        obsFilters?: Record<string, string>;
    } = {}) => {
        const url = new URL(`${REPORTING_API_BASE_URL}/projects`);

        // Standard-Parameter
        if (params.portfolio) url.searchParams.set("portfolio", params.portfolio);
        if (params.scenarios) url.searchParams.set("scenarios", params.scenarios);
        if (params.startDate) url.searchParams.set("startDate", params.startDate);
        if (params.finishDate) url.searchParams.set("finishDate", params.finishDate);

        // Custom Fields laden
        if (params.fields && params.fields.length > 0) {
            url.searchParams.set("fields", params.fields.join(","));
        }

        // OBS-Filter
        if (params.obsFilters) {
            Object.entries(params.obsFilters).forEach(([key, value]) => {
                url.searchParams.set(`obs_${key}`, value);
            });
        }

        return url.toString();
    },

    // Portfolios laden
    portfolios: () => `${REPORTING_API_BASE_URL}/portfolios`,

    // Szenarien laden
    scenarios: () => `${REPORTING_API_BASE_URL}/scenarios`,
};

// Hilfsfunktion für Reporting API Calls
export async function reportingApiFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(path, {
        ...init,
        headers: { ...mpHeaders(), ...(init.headers || {}) },
        cache: "no-store",
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Meisterplan Reporting API ${res.status}: ${text}`);
    }
    return res.json();
}

export interface Portfolio {
    portfolioId: string;
    portfolioName: string;
}

export interface Project {
    id: string;
    name: string;
    projectKey?: string;
    projectManager?: string;
    progress: number;
    scenarioId?: string;
    scenarioName?: string;
    scenarioProjectId?: string;
    projectId?: string;
    projectStart?: string;
    projectFinish?: string;
    projectManagerId?: string;
    projectManagerName?: string;
    projectStatus?: string;
    projectNotes?: string;
    businessGoalName?: string;
    customFields?: Record<string, unknown>;
}

export interface PortfoliosResponse {
    items: Portfolio[];
}

export interface ProjectsResponse {
    items: Project[];
}
