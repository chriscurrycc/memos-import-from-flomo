require('dotenv').config();
const fs = require("fs-extra");
const cheerio = require("cheerio");
var TurndownService = require("turndown");

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
      var turndownService = new TurndownService();
      text = turndownService.turndown(text);
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
  content = content.replace(flomoUrlRegex, (url) => {
    return `[MEMO =>](${url})`;
  });

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