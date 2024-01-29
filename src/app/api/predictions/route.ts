import Replicate from "replicate";
import { sql } from '@vercel/postgres';

const replicate = new Replicate();

const REPLICATE_MODEL = 'bawgz/dripfusion-trained';
const REPLICATE_MODEL_VERSION = '5c3c24d9accc09c43dd40147ad77053c1ae7905e9a025a396c8b598282ec9008';
const HOST = process.env.BASE_URL;

export async function POST() {
  const input = {
    prompt: "a photo of TOK man wearing a resort shirt, standing in front of the pyramids of Giza, instagram",
    negative_prompt: "((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck)))",
    refine: "expert_ensemble_refiner",
    high_noise_frac: 0.95,
    lora_scale_custom: 1.0,
  };

  const prediction = await replicate.predictions.create(
    {
      model: REPLICATE_MODEL,
      version: REPLICATE_MODEL_VERSION,
      webhook: `${HOST}/api/predictions/webhook`,
      input,
    }
  );

  console.log('prediction', prediction);

  const baseModel = `${REPLICATE_MODEL}:${REPLICATE_MODEL_VERSION}`;

  const sqlResult = await sql`
  INSERT INTO predictions (
    id,
    replicate_id,
    model,
    input,
    status
  )
  VALUES (
    ${crypto.randomUUID()},
    ${prediction.id},
    ${baseModel},
    ${JSON.stringify(input)},
    ${prediction.status}
  );
  `;

  return Response.json(prediction);
}