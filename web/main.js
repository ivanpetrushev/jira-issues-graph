let labelsCount = {};
let requestId = null;

async function read_config() {
  const response = await fetch('/config.json');
  const config = await response.json();
  return config;
}

async function request_listing() {
  const config = await read_config();
  console.log(config);
  const response = await fetch(config.lambda_list_issues_endpoint.value, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jira_base_url: document.getElementById('jira_base_url').value,
      access_cookies: document.getElementById('access_cookies').value,
    }),
  });
  const result = await response.json();
  console.log('result', result);
  if (result.data.labelsCount) {
    labelsCount = result.data.labelsCount;
    requestId = result.data.requestId;
    // clear old options
    const numOptions = document.getElementById('labels').options.length;
    for (let i = 0; i < numOptions; i++) {
      document.getElementById('labels').remove(i);
    }

    // add new options
    const labels = Object.keys(labelsCount);
    labels.sort((a, b) => labelsCount[b] - labelsCount[a]);
    // TODO: investigate random order of options elements generated below
    for (const label of labels) {
      const option = document.createElement('option');
      option.value = label;
      option.text = `${label} - ${labelsCount[label]} issues`;
      document.getElementById('labels').appendChild(option);
    }
  }
}

async function generate_graph() {
  const config = await read_config();
  document.getElementById('graph_url').innerHTML = 'Loading...';
  const response = await fetch(config.lambda_generate_graph_endpoint.value, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jira_base_url: document.getElementById('jira_base_url').value,
      access_cookies: document.getElementById('access_cookies').value,
      label: document.getElementById('labels').value,
      requestId: requestId,
    }),
  });
  const result = await response.json();
  console.log('result', result);
  document.getElementById(
    'graph_url'
  ).innerHTML = `<a target="_blank" href="/graph.html?id=${requestId}">See Graph</a>`;
}

function change_label(x) {
  document.getElementById('num_requests').innerHTML = `This will generate ${
    labelsCount[x.value] / 50
  } requests`;
  document.getElementById('generate_graph').disabled = false;
}
