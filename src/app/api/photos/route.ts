import Replicate from "replicate";
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/supabase'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const replicate = new Replicate();

const HOST = process.env.BASE_URL;

export async function POST(request: Request) {
  const body = await request.json();

  const trainingId = body.trainingId;

  console.log("trainingId", trainingId);

  const { error, data } = await supabase
    .from('trainings')
    .select('destination_model')
    .eq('id', trainingId)
    .single();

  if (error || !data) {
    return Response.json('Training not found', { status: 404 });
  }

  const modelParts = data.destination_model.split(':');

  const input = {
    prompt: "a photo of TOK man wearing pit viper sunglasses, standing in front of the pyramids of Giza, instagram",
    negative_prompt: "((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck)))",
    refine: "expert_ensemble_refiner",
    high_noise_frac: 0.95,
    lora_scale_custom: 1.0,
  };

  const prediction = await replicate.predictions.create(
    {
      model: modelParts[0],
      version: modelParts[1],
      webhook: `${HOST}/api/photos/webhook`,
      input,
    }
  );

  console.log('prediction', prediction);

  const photo = {
    id: crypto.randomUUID(),
    replicate_id: prediction.id,
    training_id: trainingId,
    input,
    status: prediction.status,
  }

  const result = await supabase
    .from('photos')
    .insert(photo);

  if (result.error) {
    console.log('error', result.error);
    return Response.json('Unable to create new photo', { status: 500 });
  }

  return Response.json(prediction);
}

export async function GET() {
  const { data, error } = await supabase
    .from('photos')
    .select('id, url')
    .not('url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('error', error);
    return Response.json('Unable to fetch photos', { status: 500 });
  }

  return Response.json(data);
}
