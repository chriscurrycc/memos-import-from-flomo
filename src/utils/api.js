const fs = require("fs-extra");
const path = require("path");
const mime = require("mime");
const axios = require("axios");
const FormData = require("form-data");
const chalk = require("chalk");
const { getRequestUrl, getAccessToken, openApi } = require("./utils");

const SLEEP = 1000;

default_header = {
  Authorization: `Bearer ${getAccessToken()}`,
};
const getVersion = () => {
  if (openApi.includes("/v2")) return "/v2";
  return "/v1";
};

exports.uploadFile = async (filePath) => {
  const readFile = fs.readFileSync(filePath);

  return axios({
    method: "post",
    url: getRequestUrl(`/api${getVersion()}/resources`),
    data: {
      content: readFile.toString("base64"),
      filename: path.basename(filePath),
      type: mime.getType(filePath) || undefined,
    },
    headers: default_header,
  })
    .then(async (res) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.data;
    })
    .catch((error) => {
      console.error(chalk.red("Error uploading file:"), error);
      fs.appendFileSync("error.log", `${new Date().toISOString()} - Error uploading file: ${error}\n`);
      throw error;
    });
};

exports.sendMemo = async (memo) => {
  return axios({
    method: "post",
    url: getRequestUrl(`/api${getVersion()}/memos`),
    data: memo,
    headers: {
      ...default_header,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

exports.setMemoResources = async (memoName, resources) => {
  const options = {
    method: "PATCH",
    url: getRequestUrl(`/api${getVersion()}/${memoName}/resources`),
    data: {
      resources: resources,
    },
    headers: {
      ...default_header,
      "Content-Type": "application/json; charset=UTF-8",
    },
  };

  return axios(options).then(async (res) => {
    await new Promise((resolve) => setTimeout(resolve, SLEEP));
    return res;
  });
};

exports.deleteMemo = async (memoName) => {
  return axios({
    method: "delete",
    url: getRequestUrl(`/api${getVersion()}/${memoName}`),
    headers: {
      ...default_header,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
};

exports.updateMemo = async (memoName, createTime) => {
  return axios({
    method: "PATCH",
    url: getRequestUrl(`/api${getVersion()}/${memoName}`),
    data: {
      createTime: createTime,
    },
    headers: {
      ...default_header,
      "Content-Type": "application/json; charset=UTF-8",
    },
  }).catch((error) => {
    console.error(chalk.red("Error updating memo:"), error);
    throw error;
  });
};
