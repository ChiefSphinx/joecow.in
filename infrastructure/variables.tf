variable "account_id" {
  description = "The Cloudflare account ID"
  type        = string
}

variable "project_name" {
  description = "The name of the Cloudflare Pages project"
  type        = string
  default     = "joecowin"
}

variable "production_branch" {
  description = "The production branch for the Pages project"
  type        = string
  default     = "main"
}

variable "zone_name" {
  description = "The Cloudflare zone name"
  type        = string
  default     = "joecow.in"
}
