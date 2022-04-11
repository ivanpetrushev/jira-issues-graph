const axios = require("axios");
const { listAll } = require("./queries");

const handler = async (event) => {
  console.log("event", JSON.stringify(event, null, 2));
  let success = false;
  let data = {};
  const body = JSON.parse(event.body);

  console.log(`${new Date().toISOString()} - START fetching listing`);
  const url = body.jira_base_url + "/jsw/graphql?operation=BacklogDataQuery";
  const headers = {
    accept: "application/json,text/javascript",
    "content-type": "application/json",
    cookie: body.access_cookies,
  };

  const labelsCount = {};
  const issues = [];

  try {
    const result = await axios.post(url, listAll, { headers });
    console.log("result", JSON.stringify(result.data, null, 2));
    const listing = result.data;
    
    for (const sprint of listing.data.boardScope.sprints) {
      const sprintName = sprint.name;
      console.log('sprintName', sprintName);
      for (const card of sprint.cards) {
        issues.push({
          key: card.issue.key,
          sprint: sprintName,
          status: card.issue.status.name,
        });
        if (card.issue.labels) {
          for (const label of card.issue.labels) {
            if (!labelsCount[label]) {
              labelsCount[label] = 0;
            }
            labelsCount[label]++;
          }
        }
      }
    }
    // add backlog items
    for (const card of listing.data.boardScope.backlog.cards) {
      issues.push({
        key: card.issue.key,
        sprint: "backlog",
        status: card.issue.status.name,
      });
      if (card.issue.labels) {
        for (const label of card.issue.labels) {
          if (!labelsCount[label]) {
            labelsCount[label] = 0;
          }
          labelsCount[label]++;
        }
      }
    }
    success = true;
  } catch (error) {
    console.log("error", error);
  }

  data.issues = issues;
  data.labelsCount = labelsCount;

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
