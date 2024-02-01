import { Storage } from "@google-cloud/storage";
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/supabase'

interface UpdateValues {
  status: string;
  updated_at: string;
  url?: string;
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

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

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  console.log('webook', body);

  const updateValues: UpdateValues = { status: body.status, updated_at: new Date().toISOString() };

  if (body.status === 'succeeded') {
    const id = crypto.randomUUID();

    let img = await fetch(body.output[0], { cache: 'no-store' });

    await storage.bucket('vacai')
      .file(`results/${id}.png`)
      .save(Buffer.from(await img.arrayBuffer()));

    const url = `https://storage.googleapis.com/vacai/results/${id}.png`;

    updateValues['url'] = url;
  }

  const { error } = await supabase
    .from('photos')
    .update(updateValues)
    .eq('replicate_id', body.id);


  if (error) {
    console.log('error', error);
    return Response.json('Failed to update photo', { status: 500 });
  }

  return Response.json({});
}
