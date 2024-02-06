import { createClient } from '@/utils/supabase/webhook'

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const supabase = createClient();


  console.log('webook', body);

  const updateBody = body.status === 'succeeded'
    ? { status: body.status, updated_at: new Date().toISOString(), destination_model: body.output.version }
    : { status: body.status, updated_at: new Date().toISOString() };

  const { error } = await supabase
    .from('models')
    .update(updateBody)
    .eq('replicate_training_id', body.id);

  if (error) {
    console.log('error', error);
    return Response.json('Failed to update model', { status: 500 });
  }

  return Response.json({});
}
