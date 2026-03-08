import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin, getMetrics, getUserSummaries } from "@/lib/adminQueries";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "7d";

  try {
    const [metrics, users] = await Promise.all([
      getMetrics(period),
      getUserSummaries(),
    ]);
    return NextResponse.json({ ...metrics, users });
  } catch (err) {
    console.error("Admin metrics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
