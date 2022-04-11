const AWS = require("aws-sdk");
const uuid = require("uuid");
const axios = require("axios");
const { listAll } = require("./queries");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
  console.log("event", JSON.stringify(event, null, 2));
  let success = false;
  let data = {};
  const body = JSON.parse(event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ success, data }),
    headers: {
      "Content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
};

module.exports = {
  handler,
};
