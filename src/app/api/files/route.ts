import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate();

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
        try {
          const trainingResponse = await replicate.trainings.create(
            'bawgz',
            'dripfusion-base',
            'f63d3f0d61f26ce9b2328b12588f8d1e65cc852273606aac29ef42f50a08ae62',
            {
              destination: 'bawgz/dripfusion-trained',
              input: {
                "input_images": blob.url,
                "caption_prefix": 'A photo of TOK, ',
                "use_face_detection_instead": true,
                "train_batch_size": 1,
                "max_train_steps": 2000,
                "lora_lr": 1e-4,
              }
            }
          );

          console.log('trainingResponse', trainingResponse);

        } catch (error) {
          throw new Error('Could not update user');
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