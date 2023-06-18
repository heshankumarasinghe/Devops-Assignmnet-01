#!/bin/bash
echo "export DB_NAME=$1" >> ~/.bashrc
echo "export DB_PASSWORD=$2" >> ~/.bashrc
echo "export DB_USER=$3" >> ~/.bashrc
echo "export JWT_SECRET=$4" >> ~/.bashrc
echo "export JWT_EXPIRES_IN=$5" >> ~/.bashrc
