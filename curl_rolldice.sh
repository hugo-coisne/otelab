#!/bin/bash

# URL to be called
url="http://localhost:8080/rolldice?rolls=3"

# Number of times to perform the curl request
count=100

# Loop to perform curl request 100 times
for ((i=1; i<=count; i++))
do
  echo "Request $i:"
  curl "$url"
  echo -e "\n" # Add a new line for better readability
done
