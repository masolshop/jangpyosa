import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/public/branches`);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch branches" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Branches API proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
