import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { promisify } from "util"


const randomBytes = promisify(crypto.randomBytes);
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    signatureVersion: 'v4',
});

export const generateUploadURL = async () =>{
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString('hex');

    const uploadParams = ({
        Bucket: bucketName,
        Key: imageName,
    })

    const uploadURL = await getSignedUrl(s3, new PutObjectCommand(uploadParams), {expiresIn: 60});
    return uploadURL;
}
