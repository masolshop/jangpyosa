import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  const search = searchParams.get("search") || "";

  try {
    const url = `${API_BASE}/registry/list?page=${page}&limit=${limit}&search=${encodeURIComponent(
      search
    )}`;
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Registry API proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registries" },
      { status: 500 }
    );
  }
}
