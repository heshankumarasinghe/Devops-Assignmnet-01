#!/bin/bash
echo "export DB_NAME=${{ secrets.DB_NAME }}" >> ~/.bashrc
echo "export DB_PASSWORD=${{ secrets.DB_PASSWORD }}" >> ~/.bashrc
echo "export DB_USER=${{ secrets.DB_USER }}" >> ~/.bashrc
echo "export JWT_SECRET=${{ secrets.JWT_SECRET }}" >> ~/.bashrc
echo "export JWT_EXPIRES_IN=${{ secrets.JWT_EXPIRES_IN }}" >> ~/.bashrc
