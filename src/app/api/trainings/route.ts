import { sql } from '@vercel/postgres';
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/supabase'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const REPLICATE_BASE_MODEL_OWNER = 'bawgz';
const REPLICATE_BASE_MODEL = 'dripfusion-base';
const REPLICATE_BASE_MODEL_VERSION = 'f63d3f0d61f26ce9b2328b12588f8d1e65cc852273606aac29ef42f50a08ae62';
const REPLICATE_TRAINING_DESTINATION = 'bawgz/dripfusion-trained';

export async function POST(req: Request) {

  const body = await req.json();

  const trainingInput = {
    "input_images": body.url,
    "caption_prefix": 'A photo of TOK, ',
    "use_face_detection_instead": true,
    "train_batch_size": 1,
    "max_train_steps": 3000,
    "lora_lr": 1e-4,
  };

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
      ${body.id},
      'wjjkollblo3vby2zvek6oxh63q',
      ${baseModel},
      ${REPLICATE_TRAINING_DESTINATION},
      ${JSON.stringify(trainingInput)},
      'pending'
  );
`;

  console.log('sqlResult', sqlResult);

  return Response.json({ hell: "yeah" })
}

export async function GET() {
  const { data, error } = await supabase
    .from('trainings')
    .select();

  if (error) {
    console.log('error', error);
    return Response.json('Unable to fetch trainings', { status: 500 });
  }

  console.log('data', data);

  return Response.json(data);
}
