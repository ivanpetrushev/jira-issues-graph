resource "aws_dynamodb_table" "table" {
  name         = "jira-issues-graph"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }
  attribute {
    name = "sk"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

}

# Api Gateway
resource "aws_api_gateway_rest_api" "api" {
  name = "JIRA Issues Graph RestAPI"
}

output "api_id" {
  value = "${aws_api_gateway_rest_api.api.id}"
}
