import { createTraining } from '@/actions/trainings';
import { createClient } from '@/utils/supabase/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';

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

        await createTraining(blob.pathname.replace('.zip', ''), blob.url, token.userId);
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