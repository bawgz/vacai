import { sql } from '@vercel/postgres';

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const isProcessedSuccessfully = body.status === 'succeeded'
    ? await processSuccess(body)
    : await processOther(body);

  if (!isProcessedSuccessfully) {
    throw new Error('Failed to process training webhook');
  }

  return Response.json({});
}

async function processSuccess(training: any): Promise<boolean> {
  const sqlResult = await sql`
    UPDATE trainings 
    SET status = ${training.status},
        updated_at = CURRENT_TIMESTAMP,
        destination_model = ${training.output.version}
    WHERE replicate_id = ${training.id};
  `;

  return isQuerySuccessful(sqlResult);
}

async function processOther(training: any): Promise<boolean> {
  const sqlResult = await sql`
    UPDATE trainings 
    SET status = ${training.status},
        updated_at = CURRENT_TIMESTAMP,
    WHERE replicate_id = ${training.id};
  `;

  return isQuerySuccessful(sqlResult);
}

function isQuerySuccessful(sqlResult: any): boolean {
  if (sqlResult.rowCount !== 1) {
    console.log('sqlResult', sqlResult);
    return false;
  }

  return true;
}
