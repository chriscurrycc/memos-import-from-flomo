require("dotenv").config();
const fs = require("fs-extra");
const chalk = require("chalk");

function optimizeContent(content) {
  let result = content;

  // 1. 将多个空格替换为单个空格（但不处理换行符之间的空格）
  result = result.replace(/([^\n]|^)[ \t]+([^\n]|$)/g, "$1 $2");

  // 2. 将超过两个的连续换行符（及其间的空格）替换为两个换行符
  result = result.replace(/(\n\s*){3,}/g, "\n\n");

  // 3. 清理换行符两侧的空格，但保持换行符数量
  result = result
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  return result.trim();
}

async function optimizeMemos() {
  try {
    console.log(chalk.blue("Starting memo optimization..."));

    // 读取原始 memo.json
    const memoPath = "./memo.json";
    const memos = await fs.readJSON(memoPath);

    // 保存原始文件作为备份
    const backupPath = `${memoPath}.backup-${Date.now()}`;
    await fs.copyFile(memoPath, backupPath);
    console.log(chalk.gray(`Original file backed up to: ${backupPath}`));

    let optimizedCount = 0;
    let unchangedCount = 0;

    // 优化每个 memo 的内容
    memos.forEach((memo) => {
      const originalContent = memo.content;
      const optimizedContent = optimizeContent(originalContent);

      if (originalContent !== optimizedContent) {
        optimizedCount++;
        // 输出差异预览
        console.log(chalk.yellow("\nOptimized memo:"));
        console.log(chalk.gray("Time:", memo.time));
        console.log(chalk.red("- " + originalContent.slice(0, 50) + (originalContent.length > 50 ? "..." : "")));
        console.log(chalk.green("+ " + optimizedContent.slice(0, 50) + (optimizedContent.length > 50 ? "..." : "")));

        memo.content = optimizedContent;
      } else {
        unchangedCount++;
      }
    });

    // 写入优化后的文件
    await fs.writeJSON(memoPath, memos, { spaces: 2 });

    console.log(chalk.green("\nOptimization completed!"));
    console.log(chalk.blue(`Total memos: ${memos.length}`));
    console.log(chalk.blue(`Optimized: ${optimizedCount}`));
    console.log(chalk.blue(`Unchanged: ${unchangedCount}`));
    console.log(chalk.gray(`Backup file: ${backupPath}`));
  } catch (error) {
    console.error(chalk.red("Optimization failed:", error.message));
    process.exit(1);
  }
}

function testOptimize() {
  const testCases = [
    "#Inbox/3things 2024-12-03～2024-12-10 天气：寒冷（气温低但无风）\n\n1.  工作上，",
    "text\n\ntext",
    "text \n text",
    "text\n\n\n\ntext",
    "text \n\n text",
    "text\n    \n\n\n    text",
  ];

  console.log("Testing optimization function:");
  testCases.forEach((test, index) => {
    console.log(`\nTest case ${index + 1}:`);
    console.log("Original:", JSON.stringify(test));
    console.log("Optimized:", JSON.stringify(optimizeContent(test)));
  });
}

optimizeMemos();
// 添加测试调用
testOptimize();
