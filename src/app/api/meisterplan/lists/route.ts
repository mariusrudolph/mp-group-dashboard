// app/api/meisterplan/lists/route.ts
import { NextResponse } from "next/server";
import { reportingApi, reportingApiFetch } from "@/lib/meisterplan";

export async function GET() {
    try {
        // Meisterplan hat verschiedene Arten von Listen:
        // 1. Portfolios (bereits implementiert)
        // 2. Szenarien (bereits implementiert)
        // 3. Custom Views/Listen (falls verfügbar)

        // Lade verfügbare Szenarien
        const scenariosUrl = reportingApi.scenarios();
        const scenarios = await reportingApiFetch(scenariosUrl);

        // Lade verfügbare Portfolios
        const portfoliosUrl = reportingApi.portfolios();
        const portfolios = await reportingApiFetch(portfoliosUrl);

        // Lade verfügbare Listen (falls die API das unterstützt)
        // Hinweis: Meisterplan hat möglicherweise keine direkte "Listen" API
        // Aber wir können Custom Views oder andere Strukturen verwenden

        const availableLists = [
            {
                id: "top-initiatives-2025",
                name: "Top Initiatives 2025",
                description: "Strategische Projekte für 2025",
                type: "custom",
                viewConfigId: "079ff479-e71c-4c89-a986-02f744c718aa",
                filterCriteria: {
                    cust_aligned_with_strategic_initiative: "Yes",
                    cust_business_priority: ["1", "2"]
                }
            },
            {
                id: "next-quarter-topics",
                name: "Next Quarter Topics",
                description: "Projekte für das nächste Quartal",
                type: "custom",
                viewConfigId: "4df63c9c-d824-46d4-92d4-a941c2840e81",
                filterCriteria: {
                    cust_implementation_quarter_in_connect: ["Q01/25", "Q02/25", "Q03/25", "Q04/25"]
                }
            },
            {
                id: "connect-projects",
                name: "Connect Projects",
                description: "Alle Connect-bezogenen Projekte",
                type: "custom",
                viewConfigId: "079ff479-e71c-4c89-a986-02f744c718aa", // Verwende Top Initiatives als Basis
                filterCriteria: {
                    cust_affected_systems: "Connect"
                }
            },
            {
                id: "high-priority",
                name: "High Priority Projects",
                description: "Projekte mit höchster Priorität",
                type: "custom",
                viewConfigId: "079ff479-e71c-4c89-a986-02f744c718aa", // Verwende Top Initiatives als Basis
                filterCriteria: {
                    cust_business_priority: "1"
                }
            }
        ];

        return NextResponse.json({
            lists: availableLists,
            scenarios: scenarios.items || [],
            portfolios: portfolios.items || []
        });

    } catch (error: unknown) {
        console.error("Fehler beim Laden der Listen:", error);
        const errorMessage = error instanceof Error ? error.message : "Interner Server-Fehler";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
