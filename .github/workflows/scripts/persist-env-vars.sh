#!/bin/bash
echo "export PORT=$1" >> ~/.bashrc
echo "export DB_CONNECTION_STRING=$2" >> ~/.bashrc
echo "export DB_NAME=$3" >> ~/.bashrc
echo "export DB_PASSWORD=$4" >> ~/.bashrc
echo "export DB_USER=$5" >> ~/.bashrc
echo "export JWT_SECRET=$6" >> ~/.bashrc
echo "export JWT_EXPIRES_IN=$7" >> ~/.bashrc
