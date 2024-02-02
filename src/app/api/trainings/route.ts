import { getTrainings } from '@/actions/trainings';

export async function GET() {
  const { data, error } = await getTrainings();

  if (error) {
    console.log('error', error);
    return Response.json('Unable to fetch trainings', { status: 500 });
  }

  console.log('data', data);

  return Response.json(data);
}
