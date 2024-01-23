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

  const requestBody = await request.json();

  const [buckets] = await storage.getBuckets();
  console.log('Buckets:');

  for (const bucket of buckets) {
    console.log(`- ${bucket.name}`);
  }

  console.log('Listed all storage buckets.');

  if (requestBody['shouldSkipTraining']) {
    return Response.json({
      message: 'Training skipped.'
    })
  }

  const trainingResponse = await replicate.trainings.create(
    'bawgz',
    'dripfusion-base',
    'f63d3f0d61f26ce9b2328b12588f8d1e65cc852273606aac29ef42f50a08ae62',
    {
      destination: 'bawgz/dripfusion-trained',
      input: {
        "input_images": "https://storage.googleapis.com/vacai/training-data/me2.zip",
        "caption_prefix": 'A photo of TOK, ',
        "use_face_detection_instead": true,
        "train_batch_size": 1,
        "max_train_steps": 3000,
        "lora_lr": 1e-4,
      }
    }
  );

  return Response.json(trainingResponse)
}