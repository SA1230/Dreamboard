import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getOverviewMetrics } from "@/lib/adminQueries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const metrics = await getOverviewMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json(
      { error: "Failed to fetch overview metrics" },
      { status: 500 }
    );
  }
}
