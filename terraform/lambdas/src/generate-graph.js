const AWS = require("aws-sdk");
const uuid = require("uuid");
const axios = require("axios");
const { getDetailsFragment } = require("./queries");

const dynamodb = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
  console.log("event", JSON.stringify(event, null, 2));
  let success = false;
  let data = {};
  const body = JSON.parse(event.body);
  const { label, requestId, jira_base_url, access_cookies } = body;
  const url = jira_base_url + "/rest/graphql/1/";
  const output = [];

  // fetch stored data
  const params = {
    TableName: "jira-issues-graph",
    Key: {
      pk: `listing-${requestId}`,
      sk: "listing",
    },
  };
  const result = await dynamodb.get(params).promise();

  const issues = result.Item.issues.filter((item) =>
    item.labels.includes(label)
  );

  // generate queries and fetch data
  for (let i = 0; i < issues.length; i += 50) {
    const fragments = [];
    for (let j = 0; j < 50; j += 1) {
      if (typeof issues[i + j] === "undefined") {
        break;
      }
      const text = getDetailsFragment
        .replace("#KEY#", issues[i + j].key)
        .replace("#NUMBER#", i + j);
      // console.log(text, issues[i + j].key, i + j);
      fragments.push(text);
    }
    const detailsQuery = `query abc { ${fragments.join("\n")} }`;
    // console.log(detailsQuery);

    // fire away
    const headers = {
      accept: "application/json,text/javascript",
      "content-type": "application/json",
      cookie: access_cookies,
    };
    let body = JSON.stringify({ query: detailsQuery, variables: {} });
    // console.log(body);

    console.log(
      `${new Date().toISOString()} - fetching details batch ${i /
        50} of ${issues.length / 50}`
    );
    const result = await axios.post(url, body, { headers });
    // console.log(JSON.stringify(result.data, null, 2));
    for (const [resKey, item] of Object.entries(result.data)) {
      output.push(item);
    }
    // fs.writeFileSync(detailsFilename, JSON.stringify(output, null, 2));
  }

  // store result to dynamo
  const putParams = {
    TableName: "jira-issues-graph",
    Item: {
      pk: `details-${requestId}`,
      sk: "details",
      issues: output,
    },
  };
  await dynamodb.put(putParams).promise();

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
