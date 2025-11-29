import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300; // 5 minutes for finding competitor (3-step flow with web search)
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    const response = await fetch(`${BACKEND_URL}/find-competitor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || "Failed to find competitor" },
        { status: response.status }
      );
    }

    // Log usage on successful competitor find
    if (data.success && data.data) {
      try {
        await supabase.from("usage_logs").insert({
          user_id: user.id,
          source_url: body.source_url,
          product_category: data.data.product_category || null,
          competitor_brand: data.data.competitor_brand || null,
          competitor_url: data.data.competitor_url || null,
        });
      } catch (logError) {
        // Don't fail the request if logging fails
        console.error("Failed to log usage:", logError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Request timed out finding competitor" },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

