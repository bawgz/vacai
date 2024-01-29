import { sql } from '@vercel/postgres';

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  console.log('webook', body);

  const sqlResult = body.status === 'succeeded'
    ? await sql`
      UPDATE predictions 
      SET status = ${body.status},
          updated_at = CURRENT_TIMESTAMP,
          result = ${body.output[0]}
      WHERE replicate_id = ${body.id};
    `
    : await sql`
      UPDATE predictions 
      SET status = ${body.status},
          updated_at = CURRENT_TIMESTAMP
      WHERE replicate_id = ${body.id};
    `

  console.log('sqlResult', sqlResult);

  return Response.json({ hello: 'world' });
}