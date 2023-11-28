// const S3 = require("aws-sdk/clients/s3");
// const fs = require("fs");
// const dotenv = require("dotenv").config();

// const bucketName = process.env.bucketName;
// const region = process.env.bucketRegion;
// const accessKeyId = process.env.aws_accesskey;
// const secretAccessKey = process.env.aws_secretkey;
// console.log({ bucketName, region, accessKeyId, secretAccessKey });

// const s3 = new S3({ region, accessKeyId, secretAccessKey });
// console.log(s3);

// exports.uploadFile = (file) => {
//   const fileStream = fs.createReadStream(file.path);

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: file.filename,
//   };
//   return s3.upload(uploadParams).promise();
// };
