const path = require("path");
const parse = require("url-parse");
const chalk = require("chalk");

// Replace command line arguments with environment variables
const openApi = process.env.API_HOST;
const accessToken = process.env.ACCESS_TOKEN;
const htmlPath = process.env.FLOMO_HTML_PATH;

// Add validation
if (!openApi || !accessToken || !htmlPath) {
  console.error(chalk.red('Error: Required environment variables are missing.'));
  console.error(chalk.yellow('Please make sure you have set the following in your .env file:'));
  console.error(chalk.yellow('API_HOST, ACCESS_TOKEN, FLOMO_HTML_PATH'));
  process.exit(1);
}

exports.openApi = openApi;
exports.htmlPath = htmlPath;
exports.accessToken = accessToken;
exports.getAccessToken = () => {
    return accessToken;
};

exports.getRequestUrl = (path = "") => {
  const { origin } = parse(openApi);
  const url = `${origin}${path}`;
  return url;
};

exports.getFilePath = (filePath) => {
  return path.resolve(process.cwd(), path.dirname(htmlPath), filePath);
};

exports.mergePromise = async function mergePromise(arr) {
  var mergedAjax = Promise.resolve();
  var data = [];
  for (let promise of arr) {
    mergedAjax = mergedAjax.then(() => {
      return promise().then((val) => {
        data.push(val);
      });
    });
  }
  return mergedAjax.then(() => {
    return data;
  });
};

exports.errorTip = function errorTip(error) {
  console.error(error);

  throw new Error(
    `
${chalk.red("发生错误")}

${chalk.red("可以使用 node ./src/delete.js <your-api-host> <your-access-token> 删除已经同步的数据")}

${chalk.yellow("或者反馈此问题 https://github.com/JakeLaoyu/memos-import-from-flomo/issues")}
`
  );
}