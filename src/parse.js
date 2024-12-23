require("dotenv").config();
const fs = require("fs-extra");
const cheerio = require("cheerio");
const { NodeHtmlMarkdown } = require("node-html-markdown");

const { htmlPath } = require("./utils/utils");

// Clean up old files
fs.removeSync("./memo.json");
fs.removeSync("./sendedIds.json");

const memoArr = [];

const $ = cheerio.load(fs.readFileSync(htmlPath, "utf8"));
const memos = $(".memo");

for (const memo of memos) {
  const time = $(memo).find(".time").text();
  let content = "";
  let tags = [];
  let files = [];

  $(memo)
    .find(".content")
    .each((index, html) => {
      let text = $(html).html();
      const nhm = new NodeHtmlMarkdown();
      text = nhm.translate(text);
      content += `${content ? "\n" : ""}${text}`;
    }, "");

  // Get tags using regex #xxx
  const tagReg = /#(\S*)/g;
  const tagMatch = content.match(tagReg);
  if (tagMatch) {
    tags = tagMatch.map((item) => item.replace("#", "")).filter((tag) => !!tag);
  }

  // Replace flomoapp.com URLs
  const flomoUrlRegex = /https?:\/\/(?:[\w-]+\.)*flomoapp\.com[^\s)]+/g;
  let hasFlomoUrl = false;
  content = content.replace(flomoUrlRegex, (url) => {
    hasFlomoUrl = true;
    // 修复 URL 中的转义下划线
    const fixedUrl = url.replace(/\\_/g, '_');
    return `[MEMO =>](${fixedUrl})`;
  });

  // Add FlomoMigration tag
  content += hasFlomoUrl ? "\n#FlomoMigration/NeedFix" : "\n#FlomoMigration";

  $(memo)
    .find(".files img")
    .each((index, img) => {
      const src = $(img).attr("src");
      files.push(src);
    });

  memoArr.push({
    time,
    content,
    files,
    tags,
  });
}

memoArr.sort((a, b) => {
  return new Date(b.time) - new Date(a.time);
});

fs.writeJSONSync("./memo.json", memoArr);
console.log("Parse completed. Data saved to memo.json");
