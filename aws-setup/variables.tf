variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "ssh_cidr" {
  description = "CIDR block allowed for SSH access (your IP or 0.0.0.0/0 for open)"
  type        = string
  default     = "0.0.0.0/0"
  # For security, replace with your IP: "YOUR_IP/32"
}

variable "mysql_cidr" {
  description = "CIDR block allowed for MySQL access (your local IP)"
  type        = string
  default     = "0.0.0.0/0"
  # For security, replace with your IP: "YOUR_IP/32" (e.g., "203.45.67.89/32")
}

variable "mysql_root_password" {
  description = "MySQL root password"
  type        = string
  sensitive   = true
  default     = "VinathaalDB@2024"
  # IMPORTANT: Change this to a secure password!
}
