import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { sql } from '@vercel/postgres';

const replicate = new Replicate();
const REPLICATE_BASE_MODEL_OWNER = 'bawgz';
const REPLICATE_BASE_MODEL = 'dripfusion-base';
const REPLICATE_BASE_MODEL_VERSION = 'f63d3f0d61f26ce9b2328b12588f8d1e65cc852273606aac29ef42f50a08ae62';
const REPLICATE_TRAINING_DESTINATION = 'bawgz/dripfusion-trained';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // TODO: ensure the user is authenticated
        // Generate a client token for the browser to upload the file
        return {
          allowedContentTypes: ['application/zip'],
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);

        const trainingInput = {
          "input_images": blob.url,
          "caption_prefix": 'A photo of TOK, ',
          "use_face_detection_instead": true,
          "train_batch_size": 1,
          "max_train_steps": 3000,
          "lora_lr": 1e-4,
        };

        try {
          const trainingResponse = await replicate.trainings.create(
            REPLICATE_BASE_MODEL_OWNER,
            REPLICATE_BASE_MODEL,
            REPLICATE_BASE_MODEL_VERSION,
            {
              destination: REPLICATE_TRAINING_DESTINATION,
              input: trainingInput,
            }
          );

          console.log('trainingResponse', trainingResponse);

          const baseModel = `${REPLICATE_BASE_MODEL_OWNER}/${REPLICATE_BASE_MODEL}:${REPLICATE_BASE_MODEL_VERSION}`;

          const sqlResult = await sql`
            INSERT INTO trainings (
                id, 
                replicate_id, 
                base_model,
                destination_model,
                input,
                status
            ) VALUES (
                ${blob.pathname.replace('.zip', '')},
                ${trainingResponse.id},
                ${baseModel},
                ${REPLICATE_TRAINING_DESTINATION},
                ${JSON.stringify(trainingInput)},
                'pending'
            );
          `;

          console.log('sqlResult', sqlResult);

          // use vercel/postgres to store internal id and replicate id and status

        } catch (error) {
          console.error('error', error);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}