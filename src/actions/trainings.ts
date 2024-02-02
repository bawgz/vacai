'use server';

import { createClient } from "@/utils/supabase/actions";
import { cookies } from "next/headers";
import Replicate from "replicate";

const HOST = process.env.BASE_URL;

const replicate = new Replicate();
const REPLICATE_BASE_MODEL_OWNER = 'stability-ai';
const REPLICATE_BASE_MODEL = 'sdxl';
const REPLICATE_BASE_MODEL_VERSION = '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
const REPLICATE_TRAINING_DESTINATION = 'bawgz/dripfusion-trained';

interface Response {
  data?: { id: any }[] | null;
  error?: {
    message: string,
    details?: string,
    hint?: string,
    code?: string,
  } | null;
}

export async function getTrainings(): Promise<Response> {
  const cookieStore = cookies();

  const supabase = createClient(cookieStore);

  const userData = await supabase.auth.getUser();

  if (!userData.data?.user?.id || userData.error) {
    return {
      error: { message: "User not found" }
    }
  }

  const result = await supabase
    .from('trainings')
    .select('id')
    .eq('user_id', userData.data.user.id)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false });

  return result;
}

export async function createTraining(id: string, url: string, userId: string) {
  const trainingInput = {
    "input_images": url,
    "caption_prefix": 'A photo of TOK man, ',
    "use_face_detection_instead": true,
    "train_batch_size": 1,
    "max_train_steps": 3000,
    "lora_lr": 1e-4,
  };

  try {
    const trainingResponse = await replicate.trainings.create(
      REPLICATE_BASE_MODEL_OWNER,
      REPLICATE_BASE_MODEL,
      REPLICATE_BASE_MODEL_VERSION,
      {
        destination: REPLICATE_TRAINING_DESTINATION,
        input: trainingInput,
        webhook: `${HOST}/api/trainings/webhook`,
      }
    );

    console.log('trainingResponse', trainingResponse);

    const baseModel = `${REPLICATE_BASE_MODEL_OWNER}/${REPLICATE_BASE_MODEL}:${REPLICATE_BASE_MODEL_VERSION}`;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const trainingData = {
      id: id,
      replicate_id: trainingResponse.id,
      base_model: baseModel,
      destination_model: REPLICATE_TRAINING_DESTINATION,
      input: trainingInput,
      status: trainingResponse.status,
      user_id: userId,
    }

    const { error } = await supabase
      .from('trainings')
      .insert(trainingData);

    if (error) {
      console.error('Error: failed to save training data', JSON.stringify(trainingData), error);
    }
  } catch (error) {
    throw new Error('Failed to create training');
  }
}

export async function createTrainingV2(id: string) {
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
    "caption_prefix": 'A photo of TOK man, ',
    "use_face_detection_instead": true,
    "train_batch_size": 1,
    "max_train_steps": 3000,
    "lora_lr": 1e-4,
  };

  try {
    const trainingResponse = await replicate.trainings.create(
      REPLICATE_BASE_MODEL_OWNER,
      REPLICATE_BASE_MODEL,
      REPLICATE_BASE_MODEL_VERSION,
      {
        destination: REPLICATE_TRAINING_DESTINATION,
        input: trainingInput,
        webhook: `${HOST}/api/trainings/webhook`,
      }
    );

    console.log('trainingResponse', trainingResponse);

    const baseModel = `${REPLICATE_BASE_MODEL_OWNER}/${REPLICATE_BASE_MODEL}:${REPLICATE_BASE_MODEL_VERSION}`;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const trainingData = {
      id: id,
      replicate_id: trainingResponse.id,
      base_model: baseModel,
      destination_model: REPLICATE_TRAINING_DESTINATION,
      input: trainingInput,
      status: trainingResponse.status,
      user_id: userData.data.user.id,
    }

    const { error } = await supabase
      .from('trainings')
      .insert(trainingData);

    if (error) {
      console.error('Error: failed to save training data', JSON.stringify(trainingData), error);
    }
  } catch (error) {
    throw new Error('Failed to create training');
  }
}