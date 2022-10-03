import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
  region: "eu-west-2",
});

async function saveToBucket(key: string, blob: Blob) {
  const uploadedImage = await s3
    .upload({
      Bucket: "roundwebassets",
      Key: key,
      Body: blob,
    })
    .promise();

  return uploadedImage.Location;
}

export { s3, saveToBucket };
