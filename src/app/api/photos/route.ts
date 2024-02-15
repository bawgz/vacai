import { getPhotos, createPhotos } from "@/actions/photos";

const HOST = process.env.BASE_URL;

// TODO: Do I even need these routes? I can just use actions everywhere?

export async function POST(request: Request) {
  const body = await request.json();
  const { error } = await createPhotos(body.modelId);

  if (error) {
    console.log("error", error);
    return Response.json("Unable to create photos", { status: 500 });
  }

  return Response.json({ message: "Photos created" });
}

export async function GET() {
  const { data, error } = await getPhotos();

  if (error) {
    console.log("error", error);
    return Response.json("Unable to fetch photos", { status: 500 });
  }

  return Response.json(data);
}
