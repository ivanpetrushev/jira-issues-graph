# lambda-api-gw
This is a module that will create a lambda function exposed through a API Gateway endpoint.

It creates a lambda function, API GW resource, method, integration and deployment. It also creates an OPTION method for the CORS pre-flight checks performed by browsers.

## Input variables
* name - name for the Lambda function
* source_path - where is lambda source, relative to the current directory. It is advised all Lambda sources reside in lambdas/ inside main terraform directory.
* path_part - URI path for the created API GW resource that will invoke lambda. If value here is `test` and API GW domain name is `social-login.key2market.com` then lambda will be invoked via requesting `https://social-login.key2market.com/test` 
* runtime - runtime for Lambda (default: python3.6)
* enable_vpc - if Lambda should be run in the common VPC. Supported options: `[true]` if Lambda should be run in the VPC or `[]` if it should not.
* http_method - http method that should be used when doing requests to endpoint. Supported options: GET, POST, DELETE. If you need more, you should also add them in main.tf `integration_response_options` "Access-Control-Allow-Methods"

TODO: check if all following configurations can be replaced with default values - they are all the same for every Lambda

* iam_arn = "${aws_iam_role.iam_for_lambda.arn}"
* rest_api_root_resource_id = "${aws_api_gateway_rest_api.rest_api.root_resource_id}"
* rest_api_id = "${aws_api_gateway_rest_api.rest_api.id}"
* rest_api_execution_arn = "${aws_api_gateway_rest_api.rest_api.execution_arn}"
* cognito_id = "${aws_api_gateway_authorizer.cognito.id}"

## Example usage

```
module "lambda_anomaly_show_chart" {
  source = "./lambda-api-gw"

  name = "anomaly-show-chart"
  source_path = "anomaly-show-chart"
  path_part = "anomaly_show_chart"
  enable_vpc = [true]
  http_method = "GET"
  iam_arn = "${aws_iam_role.iam_for_lambda.arn}"
  rest_api_root_resource_id = "${aws_api_gateway_rest_api.rest_api.root_resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.rest_api.id}"
  rest_api_execution_arn = "${aws_api_gateway_rest_api.rest_api.execution_arn}"
  cognito_id = "${aws_api_gateway_authorizer.cognito.id}"
}
```

## TODO

List of features for future development:
* ability to specify ENV variables for functions
* ability to attach more than one method for API GW resource (i.e. one Lambda executed on GET, another lambda executed on POST)