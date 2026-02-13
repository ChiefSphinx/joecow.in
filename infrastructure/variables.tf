variable "product" {
  description = "The prefix which should be used for all resources in this example"
  type        = string
  default     = "joecowin"
}

variable "environment" {
  description = "The environment which should be used for all resources in this example"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "The Azure Region in which all resources in this example should be created."
  type        = string
  default     = "West Europe"
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