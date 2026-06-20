# Quick Start Guide

## One-Time Setup (5 minutes)

### Step 1: Create AWS Account
- Go to https://aws.amazon.com
- Click "Create an AWS Account"
- Follow the signup process
- Add payment method (free tier won't charge)

### Step 2: Create IAM User
- Go to AWS Console → IAM → Users
- Create new user with programmatic access
- Copy the Access Key ID and Secret Access Key

### Step 3: Install Tools (Windows/Mac/Linux)

**Option A: Automated (Recommended)**
```bash
# Using Windows PowerShell or Terminal
# Download and run Terraform
# Then run: aws configure
```

**Option B: Manual**
1. Download Terraform: https://www.terraform.io/downloads
2. Download AWS CLI: https://aws.amazon.com/cli/
3. Extract Terraform to `C:\terraform` and add to PATH
4. Install AWS CLI using the installer

### Step 4: Configure AWS
```bash
aws configure
# Paste your Access Key ID
# Paste your Secret Access Key
# Default region: us-east-1
# Default output: json
```

## Deploy (2 minutes)

```bash
# Navigate to the aws-setup folder
cd aws-setup

# Initialize Terraform
terraform init

# Deploy
terraform apply
# Type: yes

# Wait 3-5 minutes for resources to be created
```

## Connect (1 minute)

After `terraform apply` completes, you'll see:
```
ec2_public_ip = "54.123.45.67"
ssh_command = "ssh -i vinathaal-key.pem ubuntu@54.123.45.67"
```

### Connect via SSH
```bash
ssh -i aws-setup/vinathaal-key.pem ubuntu@54.123.45.67
```

### Connect to MySQL
```bash
mysql -h 54.123.45.67 -u root -p
# Password: VinathaalDB@2024
```

## Deploy Vinathaal (5-10 minutes)

### 1. SSH to your server
```bash
ssh -i aws-setup/vinathaal-key.pem ubuntu@<IP>
```

### 2. Clone and setup
```bash
cd /home/ubuntu/vinathaal
git clone https://github.com/YOUR_GITHUB/vinathaal.git .
cd backend && npm install
```

### 3. Create .env file
```bash
# Edit environment variables
nano ../.env
```

Add these variables:
```
DB_HOST=localhost
DB_USER=vinathaal
DB_PASSWORD=AppUser@2024
DB_NAME=vinathaal
NODE_ENV=production
PORT=3000
```

### 4. Setup database
```bash
# If you have schema file
mysql -u vinathaal -pAppUser@2024 vinathaal < schema.sql
```

### 5. Start application
```bash
cd /home/ubuntu/vinathaal/backend
pm2 start server.js --name "vinathaal"
pm2 save
```

## Access Your App

- **Backend API**: `http://54.123.45.67:3000`
- **MySQL**: `54.123.45.67:3306` (username: `vinathaal`, password: `AppUser@2024`)

## Common Commands

```bash
# SSH to instance
ssh -i aws-setup/vinathaal-key.pem ubuntu@IP_ADDRESS

# Check what was created
terraform show

# Destroy everything (WARNING: deletes all resources)
terraform destroy

# Check instance logs
aws ec2 get-console-output --instance-ids INSTANCE_ID --region us-east-1

# SSH to server and check logs
ssh -i aws-setup/vinathaal-key.pem ubuntu@IP && tail -f /var/log/user-data.log
```

## Passwords to Remember

- **MySQL root**: `root` / `VinathaalDB@2024`
- **MySQL app user**: `vinathaal` / `AppUser@2024`
- **Database**: `vinathaal`
- **SSH key**: `aws-setup/vinathaal-key.pem` (auto-generated)

## Cost

**FREE for 12 months:**
- EC2 t2.micro: 730 hours/month
- Data transfer: Within free tier limits
- **Total: $0**

## Next Steps

1. Update security - edit `variables.tf` to restrict SSH to your IP
2. Set up SSL/HTTPS with Nginx
3. Configure automated backups
4. Monitor with CloudWatch
5. Set up domain name (Route53 or external)

## Need Help?

See full README.md in this directory for detailed information.
