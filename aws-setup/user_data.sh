#!/bin/bash
set -e

# Log script execution
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting Vinathaal server setup..."

# Update system packages
apt-get update
apt-get upgrade -y

# Install MySQL Server
apt-get install -y mysql-server

# Start MySQL service
systemctl start mysql-server
systemctl enable mysql-server

# Secure MySQL installation (non-interactive)
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'VinathaalDB@2024';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Bind MySQL to all interfaces (for remote access)
sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
systemctl restart mysql-server

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install other useful tools
apt-get install -y git curl wget unzip build-essential

# Install PM2 globally
npm install -g pm2

# Create application directory
mkdir -p /home/ubuntu/vinathaal
chown -R ubuntu:ubuntu /home/ubuntu/vinathaal

# Create MySQL database for Vinathaal
mysql -u root -pVinathaalDB@2024 -e "CREATE DATABASE IF NOT EXISTS vinathaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create application user for MySQL (optional - for security)
mysql -u root -pVinathaalDB@2024 -e "CREATE USER IF NOT EXISTS 'vinathaal'@'localhost' IDENTIFIED BY 'AppUser@2024';"
mysql -u root -pVinathaalDB@2024 -e "GRANT ALL PRIVILEGES ON vinathaal.* TO 'vinathaal'@'localhost';"
mysql -u root -pVinathaalDB@2024 -e "GRANT ALL PRIVILEGES ON vinathaal.* TO 'vinathaal'@'%';"
mysql -u root -pVinathaalDB@2024 -e "FLUSH PRIVILEGES;"

echo "Vinathaal server setup completed!"
echo "MySQL root password: VinathaalDB@2024"
echo "MySQL app user: vinathaal / AppUser@2024"
echo "Database: vinathaal"
echo "Application directory: /home/ubuntu/vinathaal"
