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