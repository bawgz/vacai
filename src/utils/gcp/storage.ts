import { Storage } from "@google-cloud/storage";

export function createStorageClient(): Storage {
  if (!process.env.GCP_CREDENTIALS) {
    throw new Error('GCP credentials not set.');
  }

  const credential = JSON.parse(
    Buffer.from(process.env.GCP_CREDENTIALS, "base64").toString()
  );

  return new Storage(
    {
      projectId: 'vacai-412020',
      credentials: {
        client_email: credential.client_email,
        private_key: credential.private_key,
      },
    }
  );
}