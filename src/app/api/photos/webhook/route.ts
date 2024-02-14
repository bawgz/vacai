import { createClient } from "@/utils/supabase/webhook";
import { createStorageClient } from "@/utils/gcp/storage";

interface UpdateValues {
  status: string;
  updated_at: string;
  url?: string;
}

const storage = createStorageClient();

export async function POST(request: Request): Promise<Response> {
  const supabase = createClient();
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

    const predictionsResponse = await supabase
      .from('predictions')
      .select('id')
      .eq('replicate_id', body.id)
      .single();

    if (predictionsResponse.error || !predictionsResponse.data) {
      console.log('Unknown failure occurred', predictionsResponse);
      return Response.json('Unknown failure occurred', { status: 500 });
    }

    const { error } = await supabase
      .from('photos')
      .update({ url })
      .eq('predictions_id', predictionsResponse.data.id);

    if (error) {
      console.log('error', error);
      return Response.json('Failed to save photo', { status: 500 });
    }

    updateValues['url'] = url;
  }

  const { error } = await supabase
    .from('predictions')
    .update(updateValues)
    .eq('replicate_id', body.id);


  if (error) {
    console.log('error', error);
    return Response.json('Failed to update photo', { status: 500 });
  }

  return Response.json({});
}
