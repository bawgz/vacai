import Replicate from "replicate";
import { getPhotos } from "@/actions/photos";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const replicate = new Replicate();

const HOST = process.env.BASE_URL;

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const clientData = await supabase.auth.getUser();

  if (!clientData.data?.user?.id || clientData.error) {
    return Response.json('Unauthorized', { status: 401 });
  }

  const modelId = body.modelId;

  const { error, data } = await supabase
    .from('models')
    .select('destination_model, class')
    .eq('id', modelId)
    .single();

  if (error || !data) {
    return Response.json('Model not found', { status: 404 });
  }

  const modelParts = data.destination_model.split(':');

  const input = {
    prompt: `a photo of TOK ${data.class}, standing in front of the pyramids of Giza, wearing a bright casual outfit, instagram`,
    negative_prompt: "((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck)))",
    refine: "expert_ensemble_refiner",
    high_noise_frac: 0.95,
    lora_scale: 0.8,
    num_inference_steps: 75,
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
    model_id: modelId,
    input,
    status: prediction.status,
    user_id: clientData.data.user.id,
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
  const { data, error } = await getPhotos();

  if (error) {
    console.log('error', error);
    return Response.json('Unable to fetch photos', { status: 500 });
  }

  return Response.json(data);
}
