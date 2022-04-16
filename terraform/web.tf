resource "aws_s3_bucket" "web" {
  bucket = var.hosting_bucket

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket_acl" "acl" {
  bucket = aws_s3_bucket.web.id
  acl    = "public-read"
}

output "web_url" {
  value = "http://${aws_s3_bucket.web.website_endpoint}/index.html"
}
output "jig_bucket" {
  value = aws_s3_bucket.web.bucket
}
