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
