const listAll = JSON.stringify({
  query: `query BacklogDataQuery ($boardId: ID!) {
      boardScope(boardId: $boardId) {
          sprints(state:[ACTIVE, FUTURE]) {
              id
              name
              startDate
              endDate
              daysRemaining
              cards {
                  id
                  issue {
                      id
                      key
                      summary
                      labels
                      status {
                          name
                      }
                      assignee {
                          displayName
                      }
                  }
                  parentId
                  estimate {
                      storyPoints
                  }
                  priority {
                      name
                  }
                  childIssuesMetadata {
                      complete
                      total
                  }
              }
              sprintState
          }
          backlog {
              boardIssueListKey
              cards {
                  id
                  issue {
                      id
                      key
                      summary
                      labels
                      status {
                          name
                      }
                      assignee {
                          displayName
                      }
                  }
                  estimate {
                      storyPoints
                  }
                  priority {
                      name
                  }
              }
          }
          
      }
  }`,
  variables: { boardId: '64' },
});

const getDetailsFragment = `res#NUMBER#: issue(issueIdOrKey: "#KEY#", latestVersion: true, screen: "view") {
  id
  key
  fields {
      key
      title
      content
  }
}`;

module.exports = {
  listAll,
  getDetailsFragment,
}