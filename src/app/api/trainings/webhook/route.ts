import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../../types/supabase'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  console.log('webook', body);

  const updateBody = body.status === 'succeeded'
    ? { status: body.status, updated_at: new Date().toISOString(), destination_model: body.output.version }
    : { status: body.status, updated_at: new Date().toISOString() };

  const { error } = await supabase
    .from('trainings')
    .update(updateBody)
    .eq('replicate_id', body.id);

  if (error) {
    console.log('error', error);
    return Response.json('Failed to update training', { status: 500 });
  }

  return Response.json({});
}
