import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { folderUrl } = await request.json();

    if (!folderUrl) {
      return NextResponse.json({ error: "folderUrl diperlukan" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Drive API Key belum dikonfigurasi di server" }, { status: 500 });
    }

    // Extract folder ID from various URL formats:
    // https://drive.google.com/drive/folders/FOLDER_ID
    // https://drive.google.com/drive/u/0/folders/FOLDER_ID
    // https://drive.google.com/open?id=FOLDER_ID
    let folderId: string | null = null;

    const foldersMatch = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (foldersMatch) {
      folderId = foldersMatch[1];
    } else {
      const openMatch = folderUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (openMatch) folderId = openMatch[1];
    }

    // If it's just a raw ID (no URL)
    if (!folderId && /^[a-zA-Z0-9_-]{10,}$/.test(folderUrl.trim())) {
      folderId = folderUrl.trim();
    }

    if (!folderId) {
      return NextResponse.json({ error: "Format URL folder Google Drive tidak valid" }, { status: 400 });
    }

    // Fetch all image files from the folder using Drive API v3
    const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
    const mimeQuery = imageTypes.map(m => `mimeType='${m}'`).join(" or ");

    // Fetch folder name
    const folderMetaUrl = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=name&key=${apiKey}`;
    let folderName = "Unknown Folder";
    try {
      const metaRes = await fetch(folderMetaUrl);
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        if (metaData.name) folderName = metaData.name;
      }
    } catch (e) {
      console.warn("Failed to fetch folder name", e);
    }

    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`'${folderId}' in parents and (${mimeQuery}) and trashed=false`)}&fields=files(id,name,mimeType)&pageSize=1000&key=${apiKey}`;

    const driveRes = await fetch(driveApiUrl);
    
    if (!driveRes.ok) {
      const errBody = await driveRes.json().catch(() => ({}));
      const errMsg = (errBody as any)?.error?.message || `Drive API error: ${driveRes.status}`;
      // Common errors:
      if (driveRes.status === 403) {
        return NextResponse.json({ 
          error: "Akses ditolak. Pastikan folder Google Drive sudah diatur ke 'Anyone with the link can view' dan API Key sudah aktif untuk Google Drive API." 
        }, { status: 403 });
      }
      return NextResponse.json({ error: errMsg }, { status: driveRes.status });
    }

    const driveData = await driveRes.json();
    const files: Array<{ id: string; name: string }> = driveData.files || [];

    if (files.length === 0) {
      return NextResponse.json({ 
        error: "Tidak ada file gambar ditemukan dalam folder ini. Pastikan folder berisi gambar (JPG/PNG/WebP) dan aksesnya sudah publik." 
      }, { status: 404 });
    }

    // Map to gallery image format
    const images = files.map((file) => ({
      id: `gdrive-${file.id}`,
      driveId: file.id,
      caption: file.name.replace(/\.[^.]+$/, ""), // strip extension for caption
      folderName: folderName,
    }));

    return NextResponse.json({ images, count: images.length });
  } catch (error: any) {
    console.error("Import folder error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
