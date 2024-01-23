import Replicate from "replicate";
import { Storage } from "@google-cloud/storage";

const replicate = new Replicate();

if (!process.env.GCP_CREDENTIALS) {
  throw new Error('GCP_CREDENTIALS not set.');
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

export async function POST(request: Request) {

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  console.log('file', file)

  if (!file) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const response = await storage.bucket('vacai').file(file.name).save(Buffer.from(await file.arrayBuffer()));

  console.log(response);


  // const uploadResponse = await storage.bucket('vacai').upload(filePath);


  return Response.json({ message: 'Hello world' })
}