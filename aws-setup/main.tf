terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Create VPC
resource "aws_vpc" "vinathaal_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vinathaal-vpc"
  }
}

# Create Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id            = aws_vpc.vinathaal_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "vinathaal-public-subnet"
  }
}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# Create Internet Gateway
resource "aws_internet_gateway" "vinathaal_igw" {
  vpc_id = aws_vpc.vinathaal_vpc.id

  tags = {
    Name = "vinathaal-igw"
  }
}

# Create Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.vinathaal_vpc.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.vinathaal_igw.id
  }

  tags = {
    Name = "vinathaal-public-rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "public_rt_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Create Security Group
resource "aws_security_group" "vinathaal_sg" {
  name        = "vinathaal-sg"
  description = "Security group for Vinathaal EC2 instance"
  vpc_id      = aws_vpc.vinathaal_vpc.id

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  # HTTP access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # MySQL access (allow from specified CIDR)
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [var.mysql_cidr]
  }

  # Outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vinathaal-sg"
  }
}

# Get latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# Create EC2 Instance
resource "aws_instance" "vinathaal_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.vinathaal_sg.id]
  key_name               = aws_key_pair.vinathaal_key.key_name

  associate_public_ip_address = true

  # User data script to install MySQL and Node.js
  user_data = base64encode(file("${path.module}/user_data.sh"))

  root_block_device {
    volume_type           = "gp2"
    volume_size           = 20
    delete_on_termination = true
  }

  tags = {
    Name = "vinathaal-server"
  }

  depends_on = [aws_internet_gateway.vinathaal_igw]
}

# Create Key Pair
resource "tls_private_key" "vinathaal_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "vinathaal_key" {
  key_name   = "vinathaal-key"
  public_key = tls_private_key.vinathaal_key.public_key_openssh
}

# Save private key locally
resource "local_file" "private_key" {
  content  = tls_private_key.vinathaal_key.private_key_pem
  filename = "${path.module}/vinathaal-key.pem"

  file_permission = "0400"
}

# Elastic IP for stable connection
resource "aws_eip" "vinathaal_eip" {
  instance = aws_instance.vinathaal_server.id
  domain   = "vpc"

  tags = {
    Name = "vinathaal-eip"
  }

  depends_on = [aws_internet_gateway.vinathaal_igw]
}

# Output the connection details
output "ec2_public_ip" {
  value       = aws_eip.vinathaal_eip.public_ip
  description = "Public IP address of the EC2 instance"
}

output "ec2_instance_id" {
  value       = aws_instance.vinathaal_server.id
  description = "EC2 instance ID"
}

output "ssh_command" {
  value       = "ssh -i vinathaal-key.pem ubuntu@${aws_eip.vinathaal_eip.public_ip}"
  description = "SSH command to connect to the instance"
}

output "mysql_connection" {
  value       = "mysql -h ${aws_eip.vinathaal_eip.public_ip} -u root -p"
  description = "MySQL connection command (password will be prompted)"
}

output "key_file_path" {
  value       = local_file.private_key.filename
  description = "Path to the private key file"
}
