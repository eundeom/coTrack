import { NextRequest, NextResponse } from "next/server";
import { visionZUpload } from "@visionz/upload-helper-react/server";

export async function POST(req: NextRequest) {
  const { status, body } = await visionZUpload(await req.json());
  return NextResponse.json(body, { status });
}
