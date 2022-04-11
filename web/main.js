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
      'jira_base_url': document.getElementById('jira_base_url').value,
      'access_cookies': document.getElementById('access_cookies').value,
    })
  });
  const result = await response.json();
  console.log('result', result);
  if (result.data.labelsCount) {
    // clear old options
    const numOptions = document.getElementById('labels').options.length;
    for (let i = 0; i < numOptions; i++) {
      document.getElementById('labels').remove(i);
    }

    // add new options
    const labels = Object.keys(result.data.labelsCount);
    labels.sort((a, b) => result.data.labelsCount[b] - result.data.labelsCount[a]);
    // TODO: why every subsequent executions create one less option? 
    for (const label of labels) {
      const option = document.createElement('option');
      option.value = label;
      option.text = `${label} - ${result.data.labelsCount[label]} issues`;
      document.getElementById('labels').appendChild(option);
    }
  }
}