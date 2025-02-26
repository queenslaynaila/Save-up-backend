#!/bin/bash

# Starting number from the last migration in migrations2/
start_number=37

# Get list of files in the current directory (migrations/) sorted numerically
files=($(ls | grep -E '^[0-9]{4}_.+\.sql$' | sort))

for file in "${files[@]}"; do
  # Extract the current filename without numbering
  new_number=$(printf "%04d" $start_number)
  new_name="${new_number}_${file:5}"  # Preserve the rest of the filename
  
  mv "$file" "$new_name"
  
  echo "Renamed: $file -> $new_name"
  
  ((start_number++))
done
