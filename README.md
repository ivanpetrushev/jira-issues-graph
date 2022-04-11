# jira-issues-graph

jira-issues-graph is a web tool to generate a graph of Jira issues and their relations.

# Deploying

Make sure you have the following env vars set:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

You can `$ cp .env.defaults .env`, fill in your credentials, `$ source .env`

Change bucket name in `terraform/vars.tf` - it must be something globally unique.

> $ cd terraform
> $ terraform init