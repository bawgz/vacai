import { sql } from '@vercel/postgres';
import { Storage } from "@google-cloud/storage";

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

  if (body.status === 'succeeded') {
    const success = await processSuccess(body);

    if (!success) {
      throw new Error('Failed to process success');
    }

    return Response.json({})
  }

  const sqlResult = await sql`
      UPDATE predictions 
      SET status = ${body.status},
          updated_at = CURRENT_TIMESTAMP
      WHERE replicate_id = ${body.id};
    `


  if (sqlResult.rowCount !== 1) {
    console.log('sqlResult', sqlResult);
    throw new Error('Failed to update prediction');
  }

  return Response.json({});
}

async function processSuccess(prediction: any): Promise<boolean> {
  const id = crypto.randomUUID();

  let img = await fetch(prediction.output[0], { cache: 'no-store' });

  await storage.bucket('vacai')
    .file(`results/${id}.png`)
    .save(Buffer.from(await img.arrayBuffer()));

  const url = `https://storage.googleapis.com/vacai/results/${id}.png`;

  const sqlResult = await sql`
    UPDATE predictions 
    SET status = ${prediction.status},
        updated_at = CURRENT_TIMESTAMP,
        result = ${url}
    WHERE replicate_id = ${prediction.id};
  `;

  console.log('sqlResult', sqlResult);

  return sqlResult.rowCount === 1;
}