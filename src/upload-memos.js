require("dotenv").config();
const fs = require("fs-extra");
const { mergePromise, errorTip } = require("./utils/utils");
const { sendMemo, updateMemo } = require("./utils/api");
const chalk = require("chalk");

const SLEEP = 1000;

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, SLEEP));
}

async function sendMemoHandler() {
  const memoArr = fs.readJSONSync("./memo.json");
  const sendedMemoNames = [];
  const sendMemoPromiseArr = [];

  console.log(chalk.blue(`Found ${memoArr.length} memos to upload`));

  for (const memo of memoArr) {
    let content = memo.content;

    // Add FlomoMigration tag
    content += "\n#FlomoMigration";

    // Add resources as markdown images if they exist
    if (memo.resources && memo.resources.length > 0) {
      content += "\n\n"; // Add blank line before resources
      memo.resources.forEach((resourceUrl) => {
        content += `![](${resourceUrl})\n`;
      });
    }

    sendMemoPromiseArr.push(async () => {
      try {
        console.log(chalk.blue("\nUploading memo..."));
        const contentPreview = content.length > 50 ? content.slice(0, 50) + "..." : content;
        console.log(chalk.gray(`Time: ${memo.time}`));
        console.log(chalk.gray(`Content preview: ${contentPreview}`));
        console.log(chalk.gray(`Resources: ${memo.resources?.length || 0}`));

        const createResponse = await sendMemo({
          content: content,
        });

        const memoName = createResponse?.data?.name || createResponse?.data?.data?.name;
        await updateMemo(memoName, new Date(memo.time).toISOString());
        await sleep();

        console.log(chalk.green("\nUpload successful!"));
        console.log(chalk.blue("Memo ID:", memoName));
        sendedMemoNames.push(memoName);
        fs.writeJSONSync("./sendedIds.json", sendedMemoNames);
        return createResponse;
      } catch (error) {
        console.error(chalk.red("\nUpload failed:", error.message));
        errorTip(error);
      }
    });
  }

  await mergePromise(sendMemoPromiseArr);
  console.log(chalk.green("\nAll memos uploaded successfully!"));
}

sendMemoHandler();
