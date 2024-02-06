import { getModels } from '@/actions/models';

export async function GET() {
  const { data, error } = await getModels();

  if (error) {
    console.log('error', error);
    return Response.json('Unable to fetch models', { status: 500 });
  }

  console.log('data', data);

  return Response.json(data);
}
