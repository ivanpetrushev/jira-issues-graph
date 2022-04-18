const AWS = require('aws-sdk');
const fs = require('fs');
const axios = require('axios');
const { getDetailsFragment } = require('./queries');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const detailsFilename = '/tmp/details.json';
const parsedFilename = '/tmp/parsed.json';

const fetchDetails = async (issues, url, access_cookies) => {
  // generate queries and fetch data
  const fetchedDetails = [];
  for (let i = 0; i < issues.length; i += 50) {
    const fragments = [];
    for (let j = 0; j < 50; j += 1) {
      if (typeof issues[i + j] === 'undefined') {
        break;
      }
      const text = getDetailsFragment
        .replace('#KEY#', issues[i + j].key)
        .replace('#NUMBER#', i + j);
      // console.log(text, issues[i + j].key, i + j);
      fragments.push(text);
    }
    const detailsQuery = `query abc { ${fragments.join('\n')} }`;
    // console.log(detailsQuery);

    // fire away
    const headers = {
      accept: 'application/json,text/javascript',
      'content-type': 'application/json',
      cookie: access_cookies,
    };
    let body = JSON.stringify({ query: detailsQuery, variables: {} });
    // console.log(body);

    console.log(
      `${new Date().toISOString()} - fetching details batch ${i / 50} of ${
        issues.length / 50
      }`
    );
    const result = await axios.post(url, body, { headers });
    // console.log(JSON.stringify(result.data, null, 2));
    for (const [resKey, item] of Object.entries(result.data)) {
      fetchedDetails.push(item);
    }
    fs.writeFileSync(detailsFilename, JSON.stringify(fetchedDetails, null, 2));
  }
};

const parseDetails = async () => {
  console.log(`${new Date().toISOString()} - START parsing details`);
  const details = JSON.parse(fs.readFileSync(detailsFilename));
  const output = [];
  for (const batch of details) {
    for (const [resKey, result] of Object.entries(batch)) {
      // console.log(result);
      const issue = {
        key: result.key,
        blockedBy: [],
        relatedInwards: [],
        relatedOutwards: [],
      };
      for (const field of result.fields) {
        if (field.key === 'summary') {
          issue.summary = field.content;
        }
        if (field.title === 'Sprint') {
          for (const item of field.content) {
            if (item.state === 'active') {
              issue.sprint = item.name;
            }
          }
        }
        if (field.key === 'labels') {
          issue.labels = field.content;
        }
        if (field.key === 'issuelinks') {
          for (const item of field.content) {
            // console.log('trying', item);
            if (
              item.type.inward === 'is blocked by' &&
              typeof item.inwardIssue !== 'undefined'
            ) {
              issue.blockedBy.push({
                key: item.inwardIssue.key,
                summary: item.inwardIssue.fields.summary,
                status: item.inwardIssue.fields.status.name,
              });
            }
            if (item.type.inward === 'relates to') {
              if (typeof item.inwardIssue !== 'undefined') {
                issue.relatedInwards.push({
                  key: item.inwardIssue.key,
                  summary: item.inwardIssue.fields.summary,
                  status: item.inwardIssue.fields.status.name,
                });
              }
              if (typeof item.outwardIssue !== 'undefined') {
                issue.relatedOutwards.push({
                  key: item.outwardIssue.key,
                  summary: item.outwardIssue.fields.summary,
                  status: item.outwardIssue.fields.status.name,
                });
              }
            }
          }
        }
        if (field.key === 'status') {
          issue.status = field.content.name;
        }
      }
      // console.log(issue);
      output.push(issue);
    }
  }
  fs.writeFileSync(parsedFilename, JSON.stringify(output, null, 2));
};

const writeVis = async (requestId) => {
  console.log(`${new Date().toISOString()} - START writing vis JSON`);
  let parsed = JSON.parse(fs.readFileSync(parsedFilename));
  // filter only X labels
  // parsed = parsed.filter((issue) => {
  //   return issue.labels.includes('X');
  // });

  const nodes = [];
  const edges = [];
  // TODO: move status colors to general config
  const groups = {
    'To Do': {
      color: 'gray',
    },
    'In Progress': {
      color: 'blue',
    },
    'Code Review': {
      color: 'blue',
    },
    Done: {
      color: 'green',
    },
  };
  for (const issue of parsed) {
    const summary = issue.summary.replace(/[^\w\d\s]/g, '');
    let color = 'black';
    if (issue.status === 'In Progress' || issue.status === 'Code Review') {
      color = 'blue';
    }
    if (issue.status === 'Done') {
      color = 'green';
    }
    nodes.push({
      id: issue.key,
      label: `${issue.key}`,
      title: `${issue.key}\n${summary}\n${issue.status}`,
      group: issue.status,
      value: issue.blockedBy.length,
    });
    for (const blockedBy of issue.blockedBy) {
      edges.push({
        from: issue.key,
        to: blockedBy.key,
        arrows: 'from',
        color: 'red',
      });
    }
    for (const relatedInwards of issue.relatedInwards) {
      edges.push({
        from: issue.key,
        to: relatedInwards.key,
        arrows: 'from,to',
        color: 'blue',
      });
    }
  }
  const output = `
  const exported_nodes = ${JSON.stringify(nodes)};
  const exported_edges = ${JSON.stringify(edges)};
  const exported_groups = ${JSON.stringify(groups)};`;

  // store result to dynamo
  const putParams = {
    TableName: 'jira-issues-graph',
    Item: {
      pk: `result-${requestId}`,
      sk: 'result',
      nodes,
      edges,
      groups,
      ttl: Math.floor(Date.now() / 1000) + 3600 * 24,
    },
  };
  await dynamodb.put(putParams).promise();
};

const handler = async (event) => {
  console.log('event', JSON.stringify(event, null, 2));
  let success = false;
  let data = {};
  const body = JSON.parse(event.body);
  const { label, requestId, jira_base_url, access_cookies } = body;
  const url = jira_base_url + '/rest/graphql/1/';

  // fetch stored data
  const params = {
    TableName: 'jira-issues-graph',
    Key: {
      pk: `listing-${requestId}`,
      sk: 'listing',
    },
  };
  const result = await dynamodb.get(params).promise();
  console.log('result', JSON.stringify(result, null, 2));

  const issues = result.Item.issues.filter((item) =>
    item.labels.includes(label)
  );

  await fetchDetails(issues, url, access_cookies);
  await parseDetails();
  await writeVis(requestId);
  success = false;

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
