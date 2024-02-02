import { createClient } from '@/utils/supabase/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';
import Replicate from "replicate";

const HOST = process.env.BASE_URL;

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
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const authResponse = await supabase.auth.getUser();

        if (authResponse.error || !authResponse.data?.user?.id) {
          console.log("Invalid auth response", authResponse);
          throw new Error('Invalid auth response');
        }
        // Generate a client token for the browser to upload the file
        return {
          allowedContentTypes: ['application/zip'],
          tokenPayload: JSON.stringify({
            userId: authResponse.data.user.id
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);

        const token = JSON.parse(tokenPayload || '{}');

        if (!token.userId) {
          throw new Error('Invalid token payload');
        }

        const trainingInput = {
          "input_images": blob.url,
          "caption_prefix": 'A photo of TOK man, ',
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
              webhook: `${HOST}/api/trainings/webhook`,
            }
          );

          console.log('trainingResponse', trainingResponse);

          const baseModel = `${REPLICATE_BASE_MODEL_OWNER}/${REPLICATE_BASE_MODEL}:${REPLICATE_BASE_MODEL_VERSION}`;

          const cookieStore = cookies();
          const supabase = createClient(cookieStore);

          const { error } = await supabase
            .from('trainings')
            .insert({
              id: blob.pathname.replace('.zip', ''),
              replicate_id: trainingResponse.id,
              base_model: baseModel,
              destination_model: REPLICATE_TRAINING_DESTINATION,
              input: trainingInput,
              status: trainingResponse.status,
              user_id: token.userId,
            });

          if (error) {
            console.error('error', error);
          }
        } catch (error) {
          throw new Error('Failed to create training');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('error', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}