resource "aws_s3_bucket" "web" {
  bucket = "${var.hosting_bucket}"
}

resource "aws_s3_bucket_acl" "acl" {
  bucket = aws_s3_bucket.web.id
  acl    = "public-read"
}

resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.web.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

output "web_url" {
  value = "https://${aws_s3_bucket.web.bucket_regional_domain_name}/index.html"
}
output "jig_bucket" {
  value = aws_s3_bucket.web.bucket
}
