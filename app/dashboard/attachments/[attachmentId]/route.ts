import { NextResponse } from "next/server";
import { getAttachmentDownloadUrl } from "@/lib/data-access/lesson-attachments";

interface AttachmentRouteContext {
  params: Promise<{ attachmentId: string }>;
}

/**
 * Stable link for an attachment. Each request re-checks access via RLS and
 * redirects to a fresh short-lived signed URL, so links on a page never expire
 * and are useless to anyone who could not open the lesson themselves.
 */
export async function GET(
  _request: Request,
  { params }: AttachmentRouteContext,
): Promise<NextResponse> {
  const { attachmentId } = await params;
  const result = await getAttachmentDownloadUrl(attachmentId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.redirect(result.data, {
    status: 303,
    headers: { "Cache-Control": "private, no-store" },
  });
}
