const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const handler = async (event) => {
  console.log('event', JSON.stringify(event, null, 2));
  let success = true;
  let data = {};
  const body = JSON.parse(event.body);
  const { requestId } = body;

  // fetch stored data
  const listingParams = {
    TableName: 'jira-issues-graph',
    Key: {
      pk: `listing-${requestId}`,
      sk: 'listing',
    },
  };
  console.log('params', listingParams);
  const listingResult = await dynamodb.get(listingParams).promise();
  data.jiraUrl = listingResult.Item.jiraUrl;

  // fetch stored data
  const resultParams = {
    TableName: 'jira-issues-graph',
    Key: {
      pk: `result-${requestId}`,
      sk: 'result',
    },
  };
  console.log('params', resultParams);
  const result = await dynamodb.get(resultParams).promise();
  data.edges = result.Item.edges;
  data.nodes = result.Item.nodes;
  data.groups = result.Item.groups;

  return {
    statusCode: 200,
    body: JSON.stringify({ success, data }),
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
  };
};

module.exports = {
  handler,
};
