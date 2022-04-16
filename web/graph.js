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
    })
  });
  const result = await response.json();
  console.log('result', result);
  edges = result.data.edges;
  nodes = result.data.nodes;
  groups = result.data.groups;
  jiraUrl = result.data.jiraUrl;
  draw();
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
  network.on('click', function(params) {
    const url = jiraUrl + '/browse/' + params.nodes[0];
    document.getElementById('info').innerHTML =
      'JIRA URL: <a target="_blank" href="' + url + '">' + url + '</a>';
  });
}