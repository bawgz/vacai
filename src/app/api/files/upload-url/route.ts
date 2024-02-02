import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";

if (!process.env.GCP_CREDENTIALS) {
  throw new Error('GCP credentials not set.');
}

const credential = JSON.parse(
  Buffer.from(process.env.GCP_CREDENTIALS, "base64").toString()
);

const storage = new Storage(
  {
    projectId: 'vacai-412020',
    credentials: {
      client_email: credential.client_email,
      private_key: credential.private_key,
    },
  }
);

export async function POST(request: Request): Promise<Response> {
  console.log('request', request);
  const body = await request.json();

  console.log('body', body);
  // These options will allow temporary uploading of the file with outgoing
  // Content-Type: application/octet-stream header.
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 1 * 60 * 1000, // 1 minute
    contentType: 'application/octet-stream'
  };

  // Get a v4 signed URL for uploading file
  const [url] = await storage
    .bucket('vacai')
    .file(`training-data/${body.fileName}`)
    .getSignedUrl(options);

  console.log('Generated PUT signed URL:');
  console.log(url);
  console.log('You can use this URL with any user agent, for example:');
  console.log(
    "curl -X PUT -H 'Content-Type: application/zip' " +
    `--upload-file my-file '${url}'`
  );

  return Response.json({ url });
}