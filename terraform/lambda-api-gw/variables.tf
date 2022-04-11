variable "name" {}
variable "source_path" {}
variable "path_part" {}
variable "runtime" {
  default = "nodejs14.x"
}
variable "timeout" {
  default = 15
}
variable "memory_size" {
  default = 128
}
variable "http_method" {
  default = "GET"
}
variable "iam_arn" {}
variable "rest_api_root_resource_id" {}
variable "rest_api_id" {}
variable "rest_api_execution_arn" {}
variable "cognito_id" {
  type = string
  default = null
}
variable "layer_arns" {
  type = list(string)
  default = []
}
variable "authorizer" {
  type = string
  default = "cognito"
}
variable "lambda_handler" {
  type = string
  default = "index.handler"
}
variable "environment" {
  type = map
  default = {}
}
variable "request_model" {
  type = string
  default = "Empty"
}
variable "response_model_200" {
  type = string
  default = null
}
variable "method_request_parameters" {
  type = map
  default = {}
}
variable "integration_request_parameters" {
  type = map
  default = {}
}