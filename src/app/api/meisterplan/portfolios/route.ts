// app/api/meisterplan/portfolios/route.ts
import { NextResponse } from "next/server";
import { reportingApi, reportingApiFetch } from "@/lib/meisterplan";

export async function GET() {
  try {
    const portfoliosUrl = reportingApi.portfolios();
    const portfolios = await reportingApiFetch(portfoliosUrl);

    return NextResponse.json({
      items: portfolios.items || []
    });

  } catch (error: unknown) {
    console.error("Fehler beim Laden der Portfolios:", error);
    const errorMessage = error instanceof Error ? error.message : "Interner Server-Fehler";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
