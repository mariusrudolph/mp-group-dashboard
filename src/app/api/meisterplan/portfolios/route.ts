// app/api/meisterplan/portfolios/route.ts
import { NextResponse } from "next/server";
import { mpFetch, type Portfolio } from "@/lib/meisterplan";

// Mock-Daten für Entwicklung/Testing
const MOCK_PORTFOLIOS = [
    { id: "1", name: "Entwicklungs-Portfolio" },
    { id: "2", name: "Marketing-Projekte" },
    { id: "3", name: "Infrastruktur" },
    { id: "4", name: "Kundenprojekte" },
];

export async function GET() {
    try {
        // Für Entwicklung: Mock-Daten zurückgeben
        if (process.env.NODE_ENV === "development" && !process.env.MEISTERPLAN_TOKEN) {
            console.log("⚠️  Verwende Mock-Portfolios für Entwicklung");
            return NextResponse.json({ items: MOCK_PORTFOLIOS });
        }

        const portfolios = await mpFetch(`/v1/portfolios`);

        // TODO: Exakte Feldnamen mit OpenAPI validieren
        const data = (portfolios.items || portfolios).map((p: any) => ({
            id: p.id,
            name: p.name ?? p.title ?? "(Unbenannt)",
        }));

        return NextResponse.json({ items: data });
    } catch (error: any) {
        console.error("Meisterplan Portfolios API Error:", error);

        // Bei API-Fehlern Mock-Daten zurückgeben (nur in Entwicklung)
        if (process.env.NODE_ENV === "development") {
            console.log("⚠️  API-Fehler - Verwende Mock-Portfolios als Fallback");
            return NextResponse.json({ items: MOCK_PORTFOLIOS });
        }

        return NextResponse.json(
            { error: error.message || "Interner Server-Fehler" },
            { status: 500 }
        );
    }
}
