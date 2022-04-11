terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "eu-central-1"
  # access_key = var.AWS_ACCESS_KEY
  # secret_key = var.AWS_SECRET_KEY
}

# terraform {
#   backend "s3" {
#     bucket = "jira-issues-graph-state"
#     key    = "network/terraform.tfstate"
#     region = "eu-central-1"
#   }
# }
