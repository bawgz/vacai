import { createClient } from "@/utils/supabase/webhook";
import { createStorageClient } from "@/utils/gcp/storage";
import { getPlaiceholder } from "plaiceholder";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

interface UpdateValues {
  status: string;
  updated_at: string;
  url?: string;
}

const storage = createStorageClient();

export async function POST(request: Request): Promise<Response> {
  const supabase = createClient();
  const body = await request.json();

  console.log("Photos webhook", body);

  // validate this is for a valid prediction
  const predictionsResponse = await supabase
    .from("predictions")
    .select("id")
    .eq("replicate_id", body.id)
    .single();

  if (predictionsResponse.error || !predictionsResponse.data) {
    console.log("Unknown failure occurred", predictionsResponse);
    return Response.json("Unknown failure occurred", { status: 500 });
  }

  if (body.status === "succeeded") {
    const promises = body.output.map((url: string, index: number) =>
      processPhoto(url, index, predictionsResponse.data.id, supabase),
    );

    const results = await Promise.all(promises);

    if (results.some((result) => result.error)) {
      console.log("Failed to process photos", results);
      return Response.json("Failed to process photos", { status: 500 });
    }
  } else {
    console.error("Non success status in replicate webhook", body);
  }

  const { error } = await supabase
    .from("predictions")
    .update({
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", predictionsResponse.data.id);

  if (error) {
    console.log("error", error);
    return Response.json("Failed to update photo", { status: 500 });
  }

  return Response.json({});
}

async function processPhoto(
  replicateUrl: string,
  index: number,
  predictionId: string,
  supabase: SupabaseClient<Database>,
): Promise<{ error: any }> {
  const id = crypto.randomUUID();

  let img = await fetch(replicateUrl);

  const buffer = Buffer.from(await img.arrayBuffer());

  await storage.bucket("vacai").file(`results/${id}.png`).save(buffer);

  const url = `https://storage.googleapis.com/vacai/results/${id}.png`;

  const { base64 } = await getPlaiceholder(buffer);

  return await supabase
    .from("photos")
    .update({ url, placeholder_data: base64 })
    .eq("predictions_id", predictionId)
    .eq("index", index);
}
