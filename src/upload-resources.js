require("dotenv").config();
const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const mime = require("mime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const { getFilePath, mergePromise } = require("./utils/utils");

// Initialize S3 client for R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(filePath, originalPath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = await fs.readFile(filePath);
  const fileName = path.basename(filePath);
  const mimeType = mime.getType(filePath) || "application/octet-stream";

  const uniqueFileName = fileName;

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: uniqueFileName,
    Body: fileContent,
    ContentType: mimeType,
  };

  try {
    console.log(chalk.blue("Starting upload..."));
    console.log(chalk.gray("File:", fileName));
    console.log(chalk.gray("Content-Type:", mimeType));

    await S3.send(new PutObjectCommand(uploadParams));
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`;

    console.log(chalk.green("\nUpload successful!"));
    console.log(chalk.blue("Public URL:", publicUrl));
    console.log(chalk.gray("Mapped:", originalPath, "→", publicUrl));
    return publicUrl;
  } catch (err) {
    console.error(chalk.red("\nUpload failed:", err.message));
    throw err;
  }
}

async function uploadFileHandler() {
  const memoArr = fs.readJSONSync("./memo.json");

  console.log(chalk.green("======================= Upload Resources ======================="));
  for (const memo of memoArr) {
    memoArr.resourceList = memoArr.resourceList || [];
    const uploadFilePromiseArr = [];

    if (memo.files.length) {
      for (const filePath of memo.files) {
        const fullPath = getFilePath(filePath);
        uploadFilePromiseArr.push(async () => {
          console.log(chalk.green("Start uploading"), filePath);
          try {
            const publicUrl = await uploadToR2(fullPath, filePath);
            return publicUrl;
          } catch (error) {
            console.error(chalk.red(`Error uploading ${filePath}:`, error));
            return null;
          }
        });
      }
    }

    const uploadedUrls = await mergePromise(uploadFilePromiseArr);
    memo.resources = [...(memo.resources || []), ...uploadedUrls.filter((url) => url)];
  }

  fs.writeJSONSync("./memo.json", memoArr);
  console.log(chalk.green("======================= Upload Resources Complete ======================="));
}

uploadFileHandler().catch((error) => {
  console.error(chalk.red("Upload failed:", error));
  process.exit(1);
});
