// app/api/meisterplan/projects/route.ts
import { NextResponse } from 'next/server';
import { reportingApiFetch, reportingApi, mpFetch } from '@/lib/meisterplan';

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

interface RegularApiProject {
    id: string;
    projectKey: string;
    name: string;
    status: { value: string };
    manager: { name: string };
    lastChanged: string;
    customFields: {
        cust_completion_percentage_in_connect?: { value: string };
        cust_implementation_progress_in_connect?: { value: string };
        cust_overall_project_progress?: { value: string };
        cust_development_progress?: { value: string };
        cust_technical_progress?: { value: string };
        cust_affected_systems?: { value: string };
        cust_aligned_with_strategic_initiative?: { value: string };
        cust_stage_gate?: { value: string };
        cust_business_priority?: { value: string };
        cust_risk?: { value: string };
        cust_functional_area?: { value: string };
        cust_implementation_quarter_in_connect?: { value: string };
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');

    console.log("🔍 Debug Info:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- MEISTERPLAN_TOKEN:", process.env.MEISTERPLAN_TOKEN ? "✅ Gesetzt" : "❌ Fehlt");
    console.log("- MEISTERPLAN_SYSTEM:", process.env.MEISTERPLAN_SYSTEM);
    console.log("- MEISTERPLAN_BASE_URL:", process.env.MEISTERPLAN_BASE_URL);

    try {
        // 1) Portfolios über Reporting API laden
        console.log("📋 Lade Portfolios über Reporting API...");
        const portfoliosResponse = await reportingApiFetch(reportingApi.portfolios());
        const portfolios = portfoliosResponse.items || [];
        console.log("✅ Portfolios geladen:", portfolios.length);

        // 2) SAG Digital Portfolio finden
        const sagDigitalPortfolio = portfolios.find((p: { portfolioName?: string }) =>
            p.portfolioName === process.env.MEISTERPLAN_PORTFOLIO_NAME
        );
        console.log("🎯 Verwende Portfolio:", process.env.MEISTERPLAN_PORTFOLIO_NAME, "ID:", sagDigitalPortfolio?.id);

        if (!sagDigitalPortfolio?.id) {
            throw new Error("SAG Digital Portfolio nicht gefunden");
        }

        // 3) Projekte über Reporting API laden
        console.log("🔗 Lade Projekte über Reporting API...");
        const fields = [
            'projectScore', 'projectApprovedBudget', 'projectStatus', 'projectNotes',
            'businessGoalName', 'cust_affected_systems', 'cust_aligned_with_strategic_initiative',
            'cust_stage_gate', 'cust_completion_percentage_in_connect',
            'cust_implementation_progress_in_connect', 'cust_business_priority',
            'cust_risk', 'cust_functional_area', 'cust_implementation_quarter_in_connect',
            'lastChanged', 'projectStart', 'projectFinish', 'projectApprovedTotalEffort',
            'cust_overall_project_progress', 'cust_development_progress', 'cust_technical_progress'
        ].join(',');

        const reportingApiUrl = `${reportingApi.projects()}?portfolio=${sagDigitalPortfolio.id}&scenarios=planOfRecord&startDate=2024-01-01&finishDate=2025-12-31&fields=${fields}`;
        console.log("🔗 Reporting API URL:", reportingApiUrl);

        const projectsResponse = await reportingApiFetch(reportingApiUrl);
        const reportingProjects = projectsResponse.items || [];
        console.log("✅ Projekte über Reporting API geladen:", reportingProjects.length);

        // 4) Zusätzlich: Custom Fields über Regular API v1 laden
        console.log("🔗 Lade Custom Fields über Regular API v1...");
        let regularApiProjects: RegularApiProject[] = [];

        try {
            // Get the Plan of Record scenario ID
            const scenariosResponse = await mpFetch('/v1/scenarios');
            const planOfRecord = scenariosResponse.items?.find((s: any) => s.name === 'Plan of Record');

            if (planOfRecord?.id) {
                // Get projects with custom fields from regular API
                const regularResponse = await mpFetch(`/v1/scenarios/${planOfRecord.id}/projects?pageSize=500`);
                regularApiProjects = regularResponse.items || [];
                console.log("✅ Custom Fields über Regular API geladen:", regularApiProjects.length);
            }
        } catch (regularApiError) {
            console.warn("⚠️ Regular API Custom Fields konnten nicht geladen werden:", regularApiError);
        }

        // 5) Projekte filtern
        console.log("🔍 Filtere Projekte nach Connect-System und Strategic Initiative...");
        let filteredProjects = reportingProjects.filter((p: MeisterplanProject) => {
            const isConnectRelated = p.cust_affected_systems?.toLowerCase().includes('connect') ||
                p.projectName?.toLowerCase().includes('connect') ||
                p.projectNotes?.toLowerCase().includes('connect') ||
                p.projectKey?.toLowerCase().includes('cmm') ||
                p.projectKey?.toLowerCase().includes('mpp') ||
                p.cust_implementation_progress_in_connect;

            const isStrategic = p.cust_aligned_with_strategic_initiative === 'Yes' ||
                p.cust_business_priority === '1' ||
                p.cust_business_priority === '2' ||
                (p.projectStatus &&
                    (p.projectStatus.includes('In Progress') ||
                        p.projectStatus.includes('In Planning') ||
                        p.projectStatus.includes('Evaluation') ||
                        p.projectStatus.includes('Closing') ||
                        p.projectStatus.includes('Done')));

            return isConnectRelated && isStrategic;
        });

        // 6) Listen-spezifische Filter anwenden
        if (listId && listId !== 'all') {
            console.log("🎯 Wende Listen-Filter an:", listId);

            switch (listId) {
                case "top-initiatives-2025":
                    filteredProjects = filteredProjects.filter((p: MeisterplanProject) =>
                        p.cust_business_priority === '1' ||
                        p.cust_business_priority === '2'
                    );
                    break;

                case "next-quarter-topics":
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

        // 7) Projekte auf unser DTO mappen
        const data = filteredProjects.map((p: MeisterplanProject) => {
            // Find matching project in regular API for custom fields
            const regularProject = regularApiProjects.find(rp =>
                rp.projectKey === p.projectKey || rp.id === p.id
            );

            // Debug logging for the first few projects
            if (filteredProjects.indexOf(p) < 5) {
                console.log("🔍 Project data:", {
                    name: p.projectName || p.name,
                    projectKey: p.projectKey,
                    cust_completion_percentage_in_connect: regularProject?.customFields?.cust_completion_percentage_in_connect?.value || p.cust_completion_percentage_in_connect,
                    cust_implementation_progress_in_connect: regularProject?.customFields?.cust_implementation_progress_in_connect?.value || p.cust_implementation_progress_in_connect,
                    cust_overall_project_progress: regularProject?.customFields?.cust_overall_project_progress?.value || p.cust_overall_project_progress,
                    cust_development_progress: regularProject?.customFields?.cust_development_progress?.value || p.cust_development_progress,
                    cust_technical_progress: regularProject?.customFields?.cust_technical_progress?.value || p.cust_technical_progress,
                    projectStatus: p.projectStatus
                });
            }

            // Overall project progress calculation - use Completion Percentage in Connect as primary source
            const overallProgress = regularProject?.customFields?.cust_completion_percentage_in_connect?.value ?
                parseInt(regularProject.customFields.cust_completion_percentage_in_connect.value.replace('%', '')) :
                p.cust_completion_percentage_in_connect ?
                    parseInt(p.cust_completion_percentage_in_connect.replace('%', '')) :
                    regularProject?.customFields?.cust_overall_project_progress?.value ?
                        parseInt(regularProject.customFields.cust_overall_project_progress.value.replace('%', '')) :
                        (p.projectStatus?.includes('In Progress') ? 50 :
                            p.projectStatus?.includes('Done') ? 100 :
                                p.projectStatus?.includes('Closing') ? 90 :
                                    p.projectStatus?.includes('In Planning') ? 25 :
                                        p.projectStatus?.includes('Evaluation') ? 15 : 0);

            // Implementation progress calculation - also use Completion Percentage in Connect
            const implementationProgress = regularProject?.customFields?.cust_completion_percentage_in_connect?.value ?
                parseInt(regularProject.customFields.cust_completion_percentage_in_connect.value.replace('%', '')) :
                p.cust_completion_percentage_in_connect ?
                    parseInt(p.cust_completion_percentage_in_connect.replace('%', '')) :
                    regularProject?.customFields?.cust_development_progress?.value ?
                        parseInt(regularProject.customFields.cust_development_progress.value.replace('%', '')) :
                        regularProject?.customFields?.cust_technical_progress?.value ?
                            parseInt(regularProject.customFields.cust_technical_progress.value.replace('%', '')) :
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
                projectManager: p.projectManagerName || p.projectManager || regularProject?.manager?.name || "Unknown",
                overallProgress: overallProgress,
                implementationProgress: Math.min(implementationProgress, 100),
                lastUpdated: regularProject?.lastChanged ? new Date(regularProject.lastChanged).toLocaleDateString('en-GB') :
                    p.lastChanged ? new Date(p.lastChanged).toLocaleDateString('en-GB') : "Unknown",
                status: p.projectStatus,
                customFields: regularProject?.customFields ? {
                    affectedSystems: regularProject.customFields.cust_affected_systems?.value,
                    strategicInitiative: regularProject.customFields.cust_aligned_with_strategic_initiative?.value,
                    stageGate: regularProject.customFields.cust_stage_gate?.value,
                    completionInConnect: regularProject.customFields.cust_completion_percentage_in_connect?.value,
                    implementationProgress: regularProject.customFields.cust_implementation_progress_in_connect?.value,
                    businessPriority: regularProject.customFields.cust_business_priority?.value,
                    risk: regularProject.customFields.cust_risk?.value,
                    functionalArea: regularProject.customFields.cust_functional_area?.value
                } : (p.cust_affected_systems ? {
                    affectedSystems: p.cust_affected_systems,
                    strategicInitiative: p.cust_aligned_with_strategic_initiative,
                    stageGate: p.cust_stage_gate,
                    completionInConnect: p.cust_completion_percentage_in_connect,
                    implementationProgress: p.cust_implementation_progress_in_connect,
                    businessPriority: p.cust_business_priority,
                    risk: p.cust_risk,
                    functionalArea: p.cust_functional_area
                } : undefined)
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
