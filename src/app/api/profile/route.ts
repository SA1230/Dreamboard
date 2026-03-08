import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.googleSub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("google_sub", session.user.googleSub)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.googleSub) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow updating user-editable fields
  const allowedFields = ["first_name", "last_name", "phone"];
  const updates: Record<string, string> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  updates.updated_at = new Date().toISOString();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("google_sub", session.user.googleSub)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
