import Replicate from "replicate";
import { Storage } from "@google-cloud/storage";
import JSZip from "jszip";

const replicate = new Replicate();

const zip = new JSZip();

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

  console.log('formData', formData);

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
    const file = value as File;
    zip.file(file.name, Buffer.from(await file.arrayBuffer()))
  }

  const zipResult = await zip.generateAsync({ type: "arraybuffer" });

  console.log('zipResult', zipResult);

  const trainingId = crypto.randomUUID();

  const response = await storage.bucket('vacai')
    .file(`${trainingId}.zip`)
    .save(Buffer.from(zipResult));

  console.log(response);

  return Response.json({ message: 'Hello world' })
}