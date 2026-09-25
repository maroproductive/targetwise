import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authenticated, sameOrigin } from "@/lib/auth";
import { mediaTypes, mediaLimits } from "@/lib/media";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 16000)
      return Response.json({ error: "Request too large" }, { status: 413 });
    const body = JSON.parse(raw) as HandleUploadBody;
    // Completion callbacks are verified by the SDK, not browser session cookies.
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!sameOrigin(request) || !(await authenticated()))
          throw new Error("Unauthorized");
        if (!process.env.BLOB_READ_WRITE_TOKEN)
          throw new Error("Media storage is not configured");
        const match =
          /^media\/(image|video)\/[a-f0-9-]{36}\.[a-z0-9]{1,10}$/.exec(
            pathname,
          );
        if (!match) throw new Error("Invalid media path");
        const kind = match[1] as "image" | "video";
        return {
          allowedContentTypes: mediaTypes[kind],
          maximumSizeInBytes: mediaLimits[kind],
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 15 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(response);
  } catch {
    return Response.json(
      {
        error:
          "Upload unavailable. Check your admin session and media storage configuration.",
      },
      { status: 400 },
    );
  }
}
