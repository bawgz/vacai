'use server';

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import Replicate from "replicate";

const HOST = process.env.BASE_URL;

const replicate = new Replicate();
const REPLICATE_BASE_MODEL_OWNER = 'fofr';
const REPLICATE_BASE_MODEL = 'realvisxl-v3';
const REPLICATE_BASE_MODEL_VERSION = '33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c';
const REPLICATE_TRAINING_DESTINATION = 'bawgz/dripfusion-trained';

interface Response {
  data?: { id: any, name: any }[] | null;
  error?: {
    message: string,
    details?: string,
    hint?: string,
    code?: string,
  } | null;
}

export async function getModels(): Promise<Response> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" }
    }
  }

  const result = await supabase
    .from('models')
    .select('id, name')
    .eq('user_id', userData.data.user.id)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false });

  return result;
}

export async function createModel(id: string, name: string, subjectClass: string) {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" }
    }
  }

  const trainingInput = {
    "input_images": `https://storage.googleapis.com/vacai/training-data/${id}.zip`,
    "caption_prefix": `A photo of TOK ${subjectClass}, `,
    "use_face_detection_instead": true,
    "train_batch_size": 1,
    "max_train_steps": 3000,
    "lora_lr": 1e-4,
  };

  try {
    const createTrainingResponse = await replicate.trainings.create(
      REPLICATE_BASE_MODEL_OWNER,
      REPLICATE_BASE_MODEL,
      REPLICATE_BASE_MODEL_VERSION,
      {
        destination: REPLICATE_TRAINING_DESTINATION,
        input: trainingInput,
        webhook: `${HOST}/api/models/webhook`,
      }
    );

    console.log('Replicate create training response: ', createTrainingResponse);

    const baseModel = `${REPLICATE_BASE_MODEL_OWNER}/${REPLICATE_BASE_MODEL}:${REPLICATE_BASE_MODEL_VERSION}`;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const modelData = {
      id: id,
      replicate_training_id: createTrainingResponse.id,
      base_model: baseModel,
      destination_model: REPLICATE_TRAINING_DESTINATION,
      input: trainingInput,
      status: createTrainingResponse.status,
      user_id: userData.data.user.id,
      name: name,
      class: subjectClass,
    }

    const { error } = await supabase
      .from('models')
      .insert(modelData);

    if (error) {
      console.error('Error: failed to save model data', JSON.stringify(modelData), error);
    }
  } catch (error) {
    throw new Error('Failed to create model');
  }
}