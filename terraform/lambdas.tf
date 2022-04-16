module "lambda_list_issues" {
  source                    = "./lambda-api-gw"
  name                      = "list-issues"
  source_path               = "."
  lambda_handler            = "src/list-issues.handler"
  path_part                 = "list-issues"
  http_method               = "POST"
  iam_arn                   = aws_iam_role.iam_for_lambda.arn
  rest_api_root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id               = aws_api_gateway_rest_api.api.id
  rest_api_execution_arn    = aws_api_gateway_rest_api.api.execution_arn
  authorizer                = "none"
  memory_size               = 256
  # environment = {
  #   STAGE = "${terraform.workspace}"
  # }
}

output "lambda_list_issues_endpoint" {
  value = module.lambda_list_issues.endpoint
}

module "lambda_generate_graph" {
  source                    = "./lambda-api-gw"
  name                      = "generate-graph"
  source_path               = "."
  lambda_handler            = "src/generate-graph.handler"
  path_part                 = "generate-graph"
  http_method               = "POST"
  iam_arn                   = aws_iam_role.iam_for_lambda.arn
  rest_api_root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id               = aws_api_gateway_rest_api.api.id
  rest_api_execution_arn    = aws_api_gateway_rest_api.api.execution_arn
  authorizer                = "none"
  memory_size               = 256
  timeout                   = 45
}

output "lambda_generate_graph_endpoint" {
  value = module.lambda_generate_graph.endpoint
}

module "lambda_get_results" {
  source                    = "./lambda-api-gw"
  name                      = "get-results"
  source_path               = "."
  lambda_handler            = "src/get-results.handler"
  path_part                 = "get-results"
  http_method               = "POST"
  iam_arn                   = aws_iam_role.iam_for_lambda.arn
  rest_api_root_resource_id = aws_api_gateway_rest_api.api.root_resource_id
  rest_api_id               = aws_api_gateway_rest_api.api.id
  rest_api_execution_arn    = aws_api_gateway_rest_api.api.execution_arn
  authorizer                = "none"
  memory_size               = 256
  timeout                   = 15
}

output "lambda_get_results_endpoint" {
  value = module.lambda_get_results.endpoint
}