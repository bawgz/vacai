import Replicate from "replicate";
import { Storage } from "@google-cloud/storage";

const replicate = new Replicate();
const storage = new Storage();

export async function POST() {
  const uploadResponse = await storage.bucket('vacai')
    .upload(
      process.cwd() + '/public/me2.zip',
      {
        destination: 'training-data/me2.zip',
      }
    );
  console.log(uploadResponse);
  const trainingResponse = await replicate.trainings.create(
    'bawgz',
    'dripfusion-base',
    'f63d3f0d61f26ce9b2328b12588f8d1e65cc852273606aac29ef42f50a08ae62',
    {
      destination: 'bawgz/dripfusion-trained',
      input: {
        "input_images": "https://storage.googleapis.com/vacai/training-data/me2.zip",
        "caption_prefix": 'A photo of TOK man, ',
        "use_face_detection_instead": true,
        "train_batch_size": 1,
        "max_train_steps": 3000,
        "lora_lr": 1e-4,
      }
    }
  );

  return Response.json(trainingResponse)
}