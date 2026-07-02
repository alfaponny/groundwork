import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const s3 = new S3Client({
  region: process.env.SPACES_REGION!,
  endpoint: process.env.SPACES_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SPACES_KEY!,
    secretAccessKey: process.env.SPACES_SECRET!,
  },
});

export async function uploadPdf(buffer: Buffer, key: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.SPACES_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    }),
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.SPACES_BUCKET!,
      Key: key,
    }),
    { expiresIn: SEVEN_DAYS_SECONDS },
  );
  return {
    url,
    expiresAt: new Date(Date.now() + SEVEN_DAYS_SECONDS * 1000).toISOString(),
  };
}
