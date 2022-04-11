data "archive_file" "file" {
  type = "zip"
  source_dir = "lambdas/${var.source_path}/"
  output_path = var.source_path == "." ? "build/all.zip" : "build/${var.source_path}.zip"
}

resource "aws_lambda_function" "fn" {
  filename = data.archive_file.file.output_path
  function_name = "${var.name}-${terraform.workspace}"
  role = var.iam_arn
  handler = var.lambda_handler
  runtime = var.runtime
  source_code_hash = data.archive_file.file.output_base64sha256
  timeout = var.timeout
  memory_size = var.memory_size
  tracing_config {
    mode = "Active"
  }
  layers = var.layer_arns

  environment {
    variables = merge({
      REGION = "eu-central-1"
    }, var.environment)
  }
}

resource "aws_api_gateway_resource" "resource" {
  parent_id = var.rest_api_root_resource_id
  path_part = var.path_part
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_method" "method" {
  authorization = var.authorizer == "cognito" ? "COGNITO_USER_POOLS" : "NONE"
  http_method = var.http_method
  resource_id = aws_api_gateway_resource.resource.id
  rest_api_id = var.rest_api_id
  authorizer_id = var.authorizer == "cognito" ? var.cognito_id : null
  request_parameters = var.method_request_parameters
  request_models = {
    "application/json" = var.request_model
  }
}

resource "aws_api_gateway_integration" "integration" {
  http_method = aws_api_gateway_method.method.http_method
  resource_id = aws_api_gateway_resource.resource.id
  rest_api_id = var.rest_api_id
  type = "AWS_PROXY"
  integration_http_method = "POST"
  uri = aws_lambda_function.fn.invoke_arn
  request_parameters = var.integration_request_parameters
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = var.rest_api_id
  stage_name = "live"
  depends_on = [
    aws_api_gateway_integration.integration,
    aws_api_gateway_integration.integration_options,
  ]
}

resource "aws_lambda_permission" "permission" {
  statement_id  = "AllowRestApiInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fn.arn
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.rest_api_execution_arn}/*/*/*"
}

resource "aws_api_gateway_method_response" "response_200" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = var.http_method
  status_code = "200"
  response_models = {
    "application/json" = var.response_model_200
  }
  count = var.response_model_200 == null ? 0 : 1
}

// enabling CORS
resource "aws_api_gateway_method" "method_options" {
  authorization = "NONE"
  http_method = "OPTIONS"
  resource_id = aws_api_gateway_resource.resource.id
  rest_api_id = var.rest_api_id
}

resource "aws_api_gateway_method_response" "method_response_options" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method.method_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}


resource "aws_api_gateway_integration" "integration_options" {
  http_method = aws_api_gateway_method.method_options.http_method
  resource_id = aws_api_gateway_resource.resource.id
  rest_api_id = var.rest_api_id
  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200 }"
  }
}

resource "aws_api_gateway_integration_response" "integration_response_options" {
  rest_api_id = var.rest_api_id
  resource_id = aws_api_gateway_resource.resource.id
  http_method = aws_api_gateway_method_response.method_response_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,DELETE,POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

output "endpoint" {
  value = "${aws_api_gateway_deployment.deployment.invoke_url}/${var.path_part}"
}