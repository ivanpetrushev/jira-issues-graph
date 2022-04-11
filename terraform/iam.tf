resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda-${terraform.workspace}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  inline_policy {
    name = "WriteLogs"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Effect   = "Allow"
          Resource = "arn:aws:logs:*:*:*"
        },
      ]
    })
  }

  inline_policy {
    name = "ReadWriteDynamodb"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["dynamodb:*"]
          Effect = "Allow"
          Resource = [
            "${aws_dynamodb_table.table.arn}",
            "${aws_dynamodb_table.table.arn}/*",
          ]
        }
      ]
    })
  }
}
