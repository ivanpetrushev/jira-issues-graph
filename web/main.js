let labelsCount = {};
let requestId = null;

async function read_config() {
  const response = await fetch('/config.json');
  const config = await response.json();
  return config;
}

async function request_listing() {
  const config = await read_config();
  document.getElementById('label_loading').classList.remove('hidden');
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
  document.getElementById('label_loading').classList.add('hidden');
  if (result.data.labelsCount) {
    labelsCount = result.data.labelsCount;
    requestId = result.data.requestId;
    // clear old options
    const numOptions = document.getElementById('select_labels').options.length;
    for (let i = 0; i < numOptions; i++) {
      document.getElementById('select_labels').remove(i);
    }

    // add option element for "All labels" - this will most likely timeout, let's not have it as a default option
    // const option = document.createElement('option');
    // option.value = '';
    // option.text = `All labels - ${result.data.totalCount} issues`;
    // document.getElementById('select_labels').appendChild(option);

    // add option element for each label
    const labels = Object.keys(labelsCount);
    labels.sort((a, b) => labelsCount[b] - labelsCount[a]);
    // TODO: investigate random order of options elements generated below
    for (const label of labels) {
      const option = document.createElement('option');
      option.value = label;
      option.text = `${label} - ${labelsCount[label]} issues`;
      document.getElementById('select_labels').appendChild(option);
    }
  }
  document.getElementById('label_labels').classList.remove('hidden');
  document.getElementById('select_labels').classList.remove('hidden');
  document.getElementById('btn_generate_graph').classList.remove('hidden');
  document.getElementById('label_more_time').classList.remove('hidden');
}

async function generate_graph() {
  const config = await read_config();
  document.getElementById('label_loading').classList.remove('hidden');
  const response = await fetch(config.lambda_generate_graph_endpoint.value, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jira_base_url: document.getElementById('jira_base_url').value,
      access_cookies: document.getElementById('access_cookies').value,
      label: document.getElementById('select_labels').value,
      requestId: requestId,
    }),
  });
  document.getElementById('label_loading').classList.add('hidden');
  const result = await response.json();
  console.log('result', result);
  document.getElementById('btn_navigate_to_graph').classList.remove('hidden');
}

function navigate_to_graph() {
  window.location.href = `/graph.html?id=${requestId}`;
}
