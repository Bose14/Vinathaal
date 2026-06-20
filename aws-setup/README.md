# Vinathaal AWS EC2 + MySQL Setup

This Terraform configuration creates a free-tier eligible AWS infrastructure for Vinathaal with:
- **EC2 t2.micro instance** (free tier eligible)
- **MySQL database** (installed on the instance)
- **Node.js & npm** pre-installed
- **PM2** for process management
- All necessary security groups and networking

## Prerequisites

1. **AWS Account** - Create a new one at [https://aws.amazon.com](https://aws.amazon.com)
   - Add payment method (free tier won't charge for eligible services)
   - Create IAM user with programmatic access

2. **Install Terraform** - Download from [https://www.terraform.io/downloads](https://www.terraform.io/downloads)

3. **Install AWS CLI** - Follow [AWS CLI installation guide](https://aws.amazon.com/cli/)

4. **Configure AWS Credentials**
   ```bash
   aws configure
   ```
   - Enter AWS Access Key ID
   - Enter AWS Secret Access Key
   - Default region: `us-east-1` (or your choice)
   - Default output format: `json`

## Deployment Steps

### 1. Navigate to the setup directory
```bash
cd aws-setup
```

### 2. Initialize Terraform
```bash
terraform init
```
This downloads the AWS provider plugin.

### 3. Review the plan (optional but recommended)
```bash
terraform plan
```
This shows what resources will be created.

### 4. Apply the configuration
```bash
terraform apply
```
- Type `yes` when prompted
- This takes 3-5 minutes
- Terraform will create:
  - VPC and networking
  - EC2 instance
  - Security groups
  - SSH key pair
  - Elastic IP address

### 5. Get connection details
After successful deployment, Terraform outputs:
```
ec2_public_ip = "xx.xx.xx.xx"
ssh_command = "ssh -i vinathaal-key.pem ubuntu@xx.xx.xx.xx"
mysql_connection = "mysql -h xx.xx.xx.xx -u root -p"
```

## Connecting to Your Server

### SSH Access
```bash
# The key file is created as: aws-setup/vinathaal-key.pem
ssh -i vinathaal-key.pem ubuntu@<PUBLIC_IP>
```

### MySQL Access
```bash
# From your local machine:
mysql -h <PUBLIC_IP> -u root -p
# Password: VinathaalDB@2024

# From the EC2 instance (after SSH):
mysql -u root -p
# Password: VinathaalDB@2024
```

### Database Details
- **Root user**: `root` / `VinathaalDB@2024`
- **App user**: `vinathaal` / `AppUser@2024`
- **Database**: `vinathaal`

## Setting Up Vinathaal Application

### 1. Connect to the instance
```bash
ssh -i vinathaal-key.pem ubuntu@<PUBLIC_IP>
```

### 2. Clone your repository
```bash
cd /home/ubuntu/vinathaal
git clone <YOUR_REPO_URL> .
```

### 3. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend (if deploying from same instance)
cd ../
npm install
```

### 4. Configure environment variables
Create `.env` file in the project root with your backend settings:
```
DB_HOST=localhost
DB_USER=vinathaal
DB_PASSWORD=AppUser@2024
DB_NAME=vinathaal
NODE_ENV=production
PORT=3000
# ... other variables
```

### 5. Run migrations (if applicable)
```bash
# Check your database setup scripts in the project
mysql -u vinathaal -pAppUser@2024 vinathaal < database-schema.sql
```

### 6. Start the application with PM2
```bash
# Backend
pm2 start backend/server.js --name "vinathaal-backend"

# Frontend (if serving from same instance)
pm2 start npm --name "vinathaal-frontend" -- run dev

# Save PM2 processes
pm2 save
pm2 startup
```

## Security Considerations

⚠️ **Important for Production:**

1. **Change default passwords** in `user_data.sh` before deployment
2. **Restrict SSH access** - Update `ssh_cidr` in `variables.tf`:
   ```hcl
   ssh_cidr = "YOUR_IP/32"  # Instead of "0.0.0.0/0"
   ```
3. **SSL/HTTPS** - Use Nginx as reverse proxy with Let's Encrypt
4. **Firewall rules** - Restrict MySQL access to your application only
5. **Backup strategy** - Set up automated MySQL backups

## Monitoring

View instance status:
```bash
# Check instance logs
aws ec2 get-console-output --instance-ids <INSTANCE_ID> --region us-east-1

# Or from the instance
tail -f /var/log/user-data.log
```

## Cleanup / Teardown

To remove all resources (when done):
```bash
terraform destroy
```
- Type `yes` when prompted
- This removes all AWS resources created
- You won't be charged for running instances

## Troubleshooting

### Can't connect via SSH?
- Verify security group allows port 22
- Check key file permissions: `chmod 600 vinathaal-key.pem`
- Wait 2-3 minutes after deployment for instance to fully boot

### MySQL connection refused?
- SSH to instance and check: `sudo systemctl status mysql-server`
- Check user-data logs: `sudo tail -f /var/log/user-data.log`

### Free tier not working?
- Verify you're using `t2.micro` instance type
- Check you have less than 750 hours/month usage
- Review [AWS Free Tier details](https://aws.amazon.com/free/)

## Cost Estimate

**Free Tier (first 12 months):**
- EC2 t2.micro: ~730 hours/month (free)
- Elastic IP: Free if attached to instance
- Data transfer: Free (within limits)
- **Total: $0/month**

**After free tier expires:** ~$10-15/month for always-on t2.micro

## Support

For issues:
1. Check Terraform output messages
2. Review AWS CloudWatch logs
3. SSH to instance and check service logs: `sudo journalctl -u mysql-server`
