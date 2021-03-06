variable "aws_region" {
  default = "eu-west-2"
}

variable "deployer_role_arn" {
  default = null
}

variable "dns_state_bucket" {
  default = ""
}

variable "dns_state_key" {
  default = ""
}

variable "dns_state_role" {
  default = ""
}

variable "environment" {
  description = "the name of the environment being deployed (e.g. sandpit, build), this also matches the PaaS space name"
}

variable "account_management_fqdn" {
  default = null
}

variable "oidc_api_fqdn" {
  default = null
}

variable "account_management_api_fqdn" {
  default = null
}
variable "frontend_fqdn" {
  default = null
}


variable "service_domain" {
  default = null
}

variable "zone_id" {
  default = null
}

variable "your_account_url" {
  type        = string
  description = "the url to the GOV.UK account - Your Account homepage"
}

variable "common_state_bucket" {
}

variable "redis_node_size" {
  default = "cache.t2.small"
}

variable "account_management_image_uri" {
  type = string
}

variable "account_management_image_tag" {
  type    = string
  default = "latest"
}

variable "account_management_image_digest" {
  type = string
}

variable "account_management_ecs_desired_count" {
  type    = number
  default = 2
}

variable "account_management_task_definition_cpu" {
  type    = number
  default = 1024
}

variable "account_management_task_definition_memory" {
  type    = number
  default = 2048
}

variable "account_management_auto_scaling_enabled" {
  default = false
}

variable "account_management_auto_scaling_min_count" {
  type    = number
  default = 2
}

variable "account_management_auto_scaling_max_count" {
  type    = number
  default = 4
}

variable "account_management_auto_scaling_policy_memory_target" {
  type    = number
  default = 75
}

variable "account_management_auto_scaling_policy_cpu_target" {
  type    = number
  default = 65
}

variable "account_management_app_port" {
  type    = number
  default = 6001
}

variable "session_expiry" {
  type = string
}

variable "gtm_id" {
  type = string
}

variable "gov_accounts_publishing_api_url" {
  type = string
}

variable "gov_account_publishing_api_token" {
  type = string
}

variable "cloudwatch_log_retention" {
  default = 1
  type    = number
}

variable "logging_endpoint_arn" {
  default = ""
}

variable "support_international_numbers" {
  type = string
}

variable "logging_endpoint_enabled" {
  type        = bool
  default     = false
  description = "Whether the service should ship its Lambda logs to the `logging_endpoint_arn`"
}

variable "deployment_min_healthy_percent" {
  default = 50
}

variable "deployment_max_percent" {
  default = 150
}

variable "health_check_grace_period_seconds" {
  default = 15
}

variable "deregistration_delay" {
  default = 30
}

variable "wellknown_cloudfront_hosted_zone_id" {
  default     = "Z2FDTNDATAQYW2"
  description = "This is the well know hosted zone ID for all cloudfront destinations"
  type        = string
}

variable "incoming_traffic_cidr_blocks" {
  default     = ["0.0.0.0/0"]
  type        = list(string)
  description = "The list of CIDR blocks allowed to send requests to the ALB"
}