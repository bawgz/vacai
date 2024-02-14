import { GetSignedUrlConfig } from "@google-cloud/storage";
import { createStorageClient } from "@/utils/gcp/storage";

const storage = createStorageClient();

export async function POST(request: Request): Promise<Response> {
  console.log("request", request);
  const body = await request.json();

  console.log("body", body);
  // These options will allow temporary uploading of the file with outgoing
  // Content-Type: application/octet-stream header.
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    expires: Date.now() + 1 * 60 * 1000, // 1 minute
    contentType: "application/octet-stream",
  };

  // Get a v4 signed URL for uploading file
  const [url] = await storage
    .bucket("vacai")
    .file(`training-data/${body.fileName}`)
    .getSignedUrl(options);

  return Response.json({ url });
}
