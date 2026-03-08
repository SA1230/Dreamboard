import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/** Shape of a single event from the client */
interface TrackingEvent {
  eventType: string;
  eventData?: Record<string, unknown>;
  timestamp?: string;
  userId: string;
}

/** Allowed event types — reject anything unexpected */
const ALLOWED_EVENT_TYPES = new Set([
  "session_start",
  "page_view",
  "xp_earned",
  "habit_toggled",
  "damage_toggled",
  "vision_added",
  "challenge_completed",
  "shop_purchase",
  "feature_used",
  "user_identified",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events: TrackingEvent[] = Array.isArray(body) ? body : [body];

    if (events.length === 0) {
      return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    // Cap batch size to prevent abuse
    if (events.length > 50) {
      return NextResponse.json({ error: "Too many events (max 50)" }, { status: 400 });
    }

    // Validate and transform events
    const rows = [];
    for (const event of events) {
      if (!event.eventType || !event.userId) {
        continue; // skip malformed events silently
      }
      if (!ALLOWED_EVENT_TYPES.has(event.eventType)) {
        continue; // skip unknown event types silently
      }

      rows.push({
        user_id: event.userId,
        event_type: event.eventType,
        event_data: event.eventData ?? {},
        created_at: event.timestamp ?? new Date().toISOString(),
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ accepted: 0 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("events").insert(rows);

    if (error) {
      console.error("Failed to insert events:", error.message);
      // Return 200 anyway — tracking should never break the app
      return NextResponse.json({ accepted: 0, error: error.message });
    }

    return NextResponse.json({ accepted: rows.length });
  } catch (err) {
    console.error("Events endpoint error:", err);
    // Always return 200 — tracking is fire-and-forget
    return NextResponse.json({ accepted: 0 });
  }
}
