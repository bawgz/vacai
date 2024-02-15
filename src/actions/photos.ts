"use server";

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import Replicate from "replicate";

const replicate = new Replicate();

const HOST = process.env.BASE_URL;
const NUM_OUTPUTS = 4;

interface GetResponse {
  data?: Photo[] | null;
  error?: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

interface CreateResponse {
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

export async function getPhotos(): Promise<GetResponse> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  console.log("userData", userData);

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" },
    };
  }

  const { data, error } = await supabase
    .from("photos")
    .select("id, url, placeholder_data, predictions!inner(user_id)")
    .eq("predictions.user_id", userData.data.user.id)
    .order("created_at", { ascending: false });

  return {
    data: data?.map((photo: Photo) => ({
      id: photo.id,
      url: photo.url,
      placeholder_data: photo.placeholder_data,
    })),
    error,
  };
}

export async function createPhotos(modelId: string): Promise<CreateResponse> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const clientData = await supabase.auth.getUser();

  if (!clientData.data?.user?.id || clientData.error) {
    return { error: { message: "User not found" } };
  }

  const { error, data } = await supabase
    .from("models")
    .select("destination_model, class")
    .eq("id", modelId)
    .single();

  if (error || !data) {
    console.error("error", error, data);
    return { error: { message: "Model not found" } };
  }

  const modelParts = data.destination_model.split(":");

  const input = {
    prompt: `a photo of TOK ${data.class}, standing in front of the pyramids of Giza, wearing a bright casual outfit, instagram`,
    negative_prompt:
      "((((ugly)))), (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), (fused fingers), (too many fingers), (((long neck)))",
    refine: "expert_ensemble_refiner",
    high_noise_frac: 0.95,
    lora_scale: 0.8,
    num_inference_steps: 75,
    num_outputs: NUM_OUTPUTS,
  };

  const prediction = await replicate.predictions.create({
    model: modelParts[0],
    version: modelParts[1],
    webhook: `${HOST}/api/photos/webhook`,
    input,
  });

  console.log("prediction", prediction);

  const predictionToSave = {
    id: crypto.randomUUID(),
    replicate_id: prediction.id,
    model_id: modelId,
    input,
    status: prediction.status,
    user_id: clientData.data.user.id,
  };

  const predictionResult = await supabase
    .from("predictions")
    .insert(predictionToSave);

  if (predictionResult.error) {
    console.error("error", predictionResult.error);
    return { error: { message: "Unable to create new prediction" } };
  }

  const photoPromises = Array.from({ length: NUM_OUTPUTS }).map((_, index) =>
    supabase.from("photos").insert({
      predictions_id: predictionToSave.id,
      index,
    }),
  );

  const photoResults = await Promise.all(photoPromises);

  const photoErrors = photoResults.filter((result) => result.error);

  if (photoErrors.length === 0) {
    return { error: null };
  }

  console.error("error", photoErrors);

  return photoErrors.length === NUM_OUTPUTS
    ? { error: { message: "Unable to create new photos" } }
    : { error: null };
}
