import Replicate from "replicate";
import { sql } from '@vercel/postgres';

const replicate = new Replicate();

const HOST = process.env.BASE_URL;

export async function POST(request: Request) {
  const body = await request.json();

  const trainingId = body.trainingId;

  console.log("trainingId", trainingId);

  const trainings = await sql`
    SELECT * FROM trainings WHERE id = ${trainingId} LIMIT 1;
  `;

  if (trainings.rowCount !== 1) {
    throw new Error('Training not found');
  }

  const modelParts = trainings.rows[0].destination_model.split(':');

  const input = {
    prompt: "a photo of TOK wearing pit viper sunglasses, standing in front of the pyramids of Giza, instagram",
    negative_prompt: "((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck)))",
    refine: "expert_ensemble_refiner",
    high_noise_frac: 0.95,
    lora_scale_custom: 1.0,
  };

  const prediction = await replicate.predictions.create(
    {
      model: modelParts[0],
      version: modelParts[1],
      webhook: `${HOST}/api/predictions/webhook`,
      input,
    }
  );

  console.log('prediction', prediction);

  const sqlResult = await sql`
    INSERT INTO predictions (
      id,
      replicate_id,
      training_id,
      input,
      status
    )
    VALUES (
      ${crypto.randomUUID()},
      ${prediction.id},
      ${trainingId},
      ${JSON.stringify(input)},
      ${prediction.status}
    );
  `;

  return Response.json(prediction);
}

export async function GET() {
  const predictions = await sql`
    SELECT * FROM predictions;
  `;

  return Response.json(predictions.rows);
}
