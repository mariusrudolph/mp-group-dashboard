// app/api/meisterplan/projects/route.ts
import { NextResponse } from "next/server";
import { reportingApi, reportingApiFetch } from "@/lib/meisterplan";

interface MeisterplanProject {
    scenarioProjectId?: string;
    projectId?: string;
    id?: string;
    projectName?: string;
    name?: string;
    projectKey?: string;
    projectManagerName?: string;
    projectManager?: string;
    projectStatus?: string;
    projectNotes?: string;
    lastChanged?: string;
    cust_affected_systems?: string;
    cust_aligned_with_strategic_initiative?: string;
    cust_stage_gate?: string;
    cust_completion_percentage_in_connect?: string;
    cust_implementation_progress_in_connect?: string;
    cust_business_priority?: string;
    cust_risk?: string;
    cust_functional_area?: string;
    cust_overall_project_progress?: string;
    cust_development_progress?: string;
    cust_technical_progress?: string;
    cust_implementation_quarter_in_connect?: string;
}

export async function GET(req: Request) {
    // Debug Info
    console.log("🔍 Debug Info:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- MEISTERPLAN_TOKEN:", process.env.MEISTERPLAN_TOKEN ? "✅ Gesetzt" : "❌ Fehlt");
    console.log("- MEISTERPLAN_SYSTEM:", process.env.MEISTERPLAN_SYSTEM);
    console.log("- MEISTERPLAN_BASE_URL:", process.env.MEISTERPLAN_BASE_URL);

    try {
        const { searchParams } = new URL(req.url);
        const listId = searchParams.get("listId"); // NEW: Get listId from query params

        // 1) Portfolios über Reporting API laden
        console.log("📋 Lade Portfolios über Reporting API...");
        const portfoliosUrl = reportingApi.portfolios();
        const portfolios = await reportingApiFetch(portfoliosUrl);
        console.log("✅ Portfolios geladen:", portfolios.items?.length);

        // 2) Portfolio "SAG Digital" finden
        const sagDigitalPortfolio = portfolios.items?.find((p: { portfolioName?: string }) =>
            p.portfolioName?.toLowerCase().includes('sag digital') ||
            p.portfolioName?.toLowerCase().includes('sag')
        );

        if (!sagDigitalPortfolio) {
            console.log("⚠️  Portfolio 'SAG Digital' nicht gefunden, verwende erstes Portfolio");
            console.log("📋 Verfügbare Portfolios:", portfolios.items?.map((p: { portfolioName?: string }) => p.portfolioName));
        }

        console.log("🎯 Verwende Portfolio:", sagDigitalPortfolio?.portfolioName, "ID:", sagDigitalPortfolio?.portfolioId);

        // 3) Projekte über Reporting API laden mit Custom Fields
        console.log("🔗 Lade Projekte über Reporting API...");
        const projectsUrl = reportingApi.projects({
            portfolio: sagDigitalPortfolio?.portfolioId,
            scenarios: "planOfRecord",
            startDate: "2024-01-01",
            finishDate: "2025-12-31",
            fields: [
                "projectScore", "projectApprovedBudget", "projectStatus", "projectNotes", "businessGoalName",
                "cust_affected_systems", "cust_aligned_with_strategic_initiative", "cust_stage_gate",
                "cust_completion_percentage_in_connect", "cust_implementation_progress_in_connect",
                "cust_business_priority", "cust_risk", "cust_functional_area",
                "cust_implementation_quarter_in_connect", // Added for "Next Quarter Projects"
                "lastChanged", "projectStart", "projectFinish", "projectApprovedTotalEffort",
                "cust_overall_project_progress", "cust_development_progress", "cust_technical_progress"
            ]
        });

        console.log("🔗 Reporting API URL:", projectsUrl);
        const projects = await reportingApiFetch(projectsUrl);
        console.log("✅ Projekte über Reporting API geladen:", projects.items?.length);

        // 4) Projekte nach den gewünschten Kriterien filtern
        console.log("🔍 Filtere Projekte nach Connect-System und Strategic Initiative...");

        let filteredProjects = (projects.items || []);

        // Wenn eine spezifische Liste ausgewählt wurde, wende zusätzliche Filter an
        if (listId) {
            console.log(`🎯 Wende Listen-Filter an: ${listId}`);

            switch (listId) {
                case "top-initiatives-2025":
                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) =>
                        p.cust_aligned_with_strategic_initiative === 'Yes' &&
                        (p.cust_business_priority === '1' || p.cust_business_priority === '2')
                    );
                    break;

                case "next-quarter-topics": // Renamed from next-quarter-projects
                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) =>
                        p.cust_implementation_quarter_in_connect &&
                        (p.cust_implementation_quarter_in_connect.includes('Q01/25') ||
                            p.cust_implementation_quarter_in_connect.includes('Q02/25') ||
                            p.cust_implementation_quarter_in_connect.includes('Q03/25') ||
                            p.cust_implementation_quarter_in_connect.includes('Q04/25'))
                    );
                    break;

                case "connect-projects":
                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) =>
                        p.cust_affected_systems?.toLowerCase().includes('connect') ||
                        p.projectName?.toLowerCase().includes('connect') ||
                        p.projectNotes?.toLowerCase().includes('connect')
                    );
                    break;

                case "high-priority":
                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) =>
                        p.cust_business_priority === '1'
                    );
                    break;

                default:
                    // Standard-Filter für alle Projekte
                    const isConnectRelatedDefault = (p: MeisterplanProject) =>
                        p.projectName?.toLowerCase().includes('connect') ||
                        p.projectNotes?.toLowerCase().includes('connect') ||
                        p.projectKey?.toLowerCase().includes('cmm') ||
                        p.projectKey?.toLowerCase().includes('mpp') ||
                        p.cust_affected_systems?.toLowerCase().includes('connect') ||
                        p.cust_implementation_progress_in_connect;

                    const isStrategicDefault = (p: MeisterplanProject) =>
                        p.cust_aligned_with_strategic_initiative === 'Yes' ||
                        p.cust_business_priority === '1' ||
                        p.cust_business_priority === '2' ||
                        (p.projectStatus &&
                            (p.projectStatus.includes('In Progress') ||
                                p.projectStatus.includes('In Planning') ||
                                p.projectStatus.includes('Evaluation') ||
                                p.projectStatus.includes('Closing') ||
                                p.projectStatus.includes('Done')));

                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) => isConnectRelatedDefault(p) && isStrategicDefault(p));
            }
        } else {
            // Standard-Filter für alle Projekte
            const isConnectRelatedDefault = (p: MeisterplanProject) =>
                p.projectName?.toLowerCase().includes('connect') ||
                p.projectNotes?.toLowerCase().includes('connect') ||
                p.projectKey?.toLowerCase().includes('cmm') ||
                p.projectKey?.toLowerCase().includes('mpp') ||
                p.cust_affected_systems?.toLowerCase().includes('connect') ||
                p.cust_implementation_progress_in_connect;

            const isStrategicDefault = (p: MeisterplanProject) =>
                p.cust_aligned_with_strategic_initiative === 'Yes' ||
                p.cust_business_priority === '1' ||
                p.cust_business_priority === '2' ||
                (p.projectStatus &&
                    (p.projectStatus.includes('In Progress') ||
                        p.projectStatus.includes('In Planning') ||
                        p.projectStatus.includes('Evaluation') ||
                        p.projectStatus.includes('Closing') ||
                        p.projectStatus.includes('Done')));

            filteredProjects = filteredProjects.filter((p: MeisterplanProject) => isConnectRelatedDefault(p) && isStrategicDefault(p));
        }

        console.log("✅ Gefilterte Projekte:", filteredProjects.length);

        // 5) Projekte auf unser DTO mappen
        const data = filteredProjects.map((p: MeisterplanProject) => {
            // Debug logging for the first few projects
            if (filteredProjects.indexOf(p) < 5) {
                console.log("🔍 Project data:", {
                    name: p.projectName || p.name,
                    projectKey: p.projectKey,
                    cust_completion_percentage_in_connect: p.cust_completion_percentage_in_connect,
                    cust_implementation_progress_in_connect: p.cust_implementation_progress_in_connect,
                    cust_overall_project_progress: p.cust_overall_project_progress,
                    cust_development_progress: p.cust_development_progress,
                    cust_technical_progress: p.cust_technical_progress,
                    projectStatus: p.projectStatus
                });
            }

            // Overall project progress calculation - use Completion Percentage in Connect as primary source
            const overallProgress = p.cust_completion_percentage_in_connect ?
                parseInt(p.cust_completion_percentage_in_connect.replace('%', '')) :
                p.cust_overall_project_progress ?
                    parseInt(p.cust_overall_project_progress.replace('%', '')) :
                    (p.projectStatus?.includes('In Progress') ? 50 :
                        p.projectStatus?.includes('Done') ? 100 :
                            p.projectStatus?.includes('Closing') ? 90 :
                                p.projectStatus?.includes('In Planning') ? 25 :
                                    p.projectStatus?.includes('Evaluation') ? 15 : 0);

            // Implementation progress calculation - also use Completion Percentage in Connect
            const implementationProgress = p.cust_completion_percentage_in_connect ?
                parseInt(p.cust_completion_percentage_in_connect.replace('%', '')) :
                p.cust_development_progress ?
                    parseInt(p.cust_development_progress.replace('%', '')) :
                    p.cust_technical_progress ?
                        parseInt(p.cust_technical_progress.replace('%', '')) :
                        p.cust_implementation_progress_in_connect ?
                            (p.cust_implementation_progress_in_connect === 'Concept & Design' ? 25 :
                                p.cust_implementation_progress_in_connect === 'In Progress' ? 50 :
                                    p.cust_implementation_progress_in_connect === 'Testing' ? 75 :
                                        p.cust_implementation_progress_in_connect === 'Go Live' ? 100 : 0) :
                            overallProgress; // Use overall progress as fallback

            return {
                id: p.scenarioProjectId || p.projectId || p.id || '',
                name: p.projectName || p.name || "(Unnamed)",
                projectKey: p.projectKey || "",
                projectManager: p.projectManagerName || p.projectManager || "Unknown",
                overallProgress: overallProgress,
                implementationProgress: Math.min(implementationProgress, 100),
                lastUpdated: p.lastChanged ? new Date(p.lastChanged).toLocaleDateString('en-GB') : "Unknown",
                status: p.projectStatus,
                customFields: p.cust_affected_systems ? {
                    affectedSystems: p.cust_affected_systems,
                    strategicInitiative: p.cust_aligned_with_strategic_initiative,
                    stageGate: p.cust_stage_gate,
                    completionInConnect: p.cust_completion_percentage_in_connect,
                    implementationProgress: p.cust_implementation_progress_in_connect,
                    businessPriority: p.cust_business_priority,
                    risk: p.cust_risk,
                    functionalArea: p.cust_functional_area
                } : undefined
            };
        });

        console.log("✅ Gefundene gefilterte Projekte:", data.length);
        if (data.length > 0) {
            console.log("📊 Erste 3 Projekte:", data.slice(0, 3));
        }

        return NextResponse.json({
            portfolio: sagDigitalPortfolio?.portfolioName || "SAG Digital",
            items: data
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ Meisterplan Reporting API Error:', error);
        
        // Return empty array instead of mock data to ensure real data only
        return NextResponse.json({
            portfolio: "SAG Digital",
            items: []
        }, { status: 500 });
    }
}
