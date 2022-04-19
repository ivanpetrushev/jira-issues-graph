async function read_config() {
  const response = await fetch('/config.json');
  const config = await response.json();
  return config;
}

let edges = null;
let nodes = null;
let groups = null;
let jiraUrl = null;

async function load_graph() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const { id } = params;

  const config = await read_config();
  const response = await fetch(config.lambda_get_results_endpoint.value, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: id,
    }),
  });
  const result = await response.json();
  console.log('result', result);
  if (result.success) {
    edges = result.data.edges;
    nodes = result.data.nodes;
    groups = result.data.groups;
    jiraUrl = result.data.jiraUrl;
    draw();
  } else {
    document.getElementById('info').innerHTML =
      'Requested ID is not available. Try creating a new graph.';
  }
}

function draw() {
  // create a network
  const container = document.getElementById('mynetwork');
  const data = {
    nodes,
    edges,
  };
  const options = {
    nodes: {
      shape: 'dot',
      size: 16,
      scaling: {
        // label: {
        //   enabled: true,
        // },
        // customScalingFunction: function(min, max, total, value) {
        //   console.log(min, max, total, value);
        //   return value;
        // },
      },
    },
    groups: groups,
    physics: {
      // forceAtlas2Based: {
      //   gravitationalConstant: -26,
      //   centralGravity: 0.005,
      //   springLength: 230,
      //   springConstant: 0.18,
      // },
      maxVelocity: 146,
      solver: 'forceAtlas2Based',
      timestep: 0.35,
      stabilization: { iterations: 150 },
    },
  };
  const network = new vis.Network(container, data, options);
  network.on('click', function (params) {
    if (params.nodes.length === 0) {
      // not clicked on a node
      return;
    }
    const issue = nodes.find((node) => node.id === params.nodes[0]);

    const url = jiraUrl + '/browse/' + issue.id;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.innerHTML = issue.id + ' in JIRA';
    a.classList =
      'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded my-3';
    document.getElementById('btn_jira').innerHTML = '';
    document.getElementById('btn_jira').appendChild(a);

    document.getElementById('label_status').innerHTML = issue.group;
    document.getElementById('label_status').classList =
      'font-bold py-2 px-4 border border-blue-700 rounded my-3';
    document.getElementById(
      'label_summary'
    ).innerHTML = `${issue.id} ${issue.summary}`;
  });
}
