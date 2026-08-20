import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const size = searchParams.get("sz") || "w800";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Try Google Drive thumbnail API
  const driveUrl = `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;

  try {
    const response = await fetch(driveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      // Fallback: try uc export
      const fallbackUrl = `https://drive.google.com/uc?export=view&id=${id}`;
      const fallback = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "image/*,*/*;q=0.8",
        },
        redirect: "follow",
      });

      if (!fallback.ok) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      const contentType = fallback.headers.get("content-type") || "image/jpeg";
      const buffer = await fallback.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
