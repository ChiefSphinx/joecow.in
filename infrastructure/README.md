# Infrastructure

This directory contains Terraform configuration for provisioning Cloudflare resources.

## Files

- `main.tf` - Terraform configuration and provider setup
- `cloudflare.tf` - Cloudflare zone and Pages project resources
- `dns.tf` - DNS records for the domain
- `variables.tf` - Input variables for Terraform

## Resources Provisioned

| Resource | Description |
|----------|-------------|
| `cloudflare_zone.joecowin` | DNS zone for joecow.in |
| `cloudflare_pages_project.joecowin` | Cloudflare Pages project |
| `cloudflare_dns_record.root` | CNAME record for @ → joecowin.pages.dev |
| `cloudflare_dns_record.www` | CNAME record for www → joecowin.pages.dev |

## Usage

1. Install [Terraform](https://www.terraform.io/downloads.html).
2. Initialize the working directory:
   ```sh
   terraform init
   ```
3. Review and apply the configuration:
   ```sh
   terraform plan
   terraform apply
   ```

> **Note:** State files and sensitive files are ignored via `.gitignore` in this directory.
