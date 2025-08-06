import { z } from 'zod';
import { Router } from '../core/router';
import { UserRole } from './users/schema';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Config from '../config';

const s3 = new S3Client({
  region: Config.S3_REGION,
  credentials: {
    accessKeyId: Config.S3_ACCESS_KEY,
    secretAccessKey: Config.S3_SECRET_KEY
  }
});

const generatePresignedUrl = async (key: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: Config.S3_BUCKET_NAME,
    Key: key,
    ContentType: 'image/png'
  });

  return getSignedUrl(s3, command, { expiresIn: 600 });
};

const generateUrl = (router: Router) => {
  router.get({
    path: '/',
    auth: UserRole.enum.Admin,
    summary: 'Generate a presigned URL for uploading an image',
    schema: {
      query: z.object({
        key: z.string()
      })
    },
    response: {
      schema: z.object({
        url: z.string()
      })
    },
    handler: async (req, res) => {
      const { key } = req.query;
      const url = await generatePresignedUrl(key);
      res.json({ url });
    }
  });
};

const router = Router.getOrCreateRouter('S3');
generateUrl(router);
export default router;
