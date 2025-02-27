#!/bin/bash

set -e  # Exit on error

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

target_file="$1"
if [ ! -f "$target_file" ]; then
    echo "Error: File '$target_file' not found."
    exit 1
fi

# Extract the numeric prefix from the target filename
original_number=$(echo "$target_file" | grep -oE '^[0-9]+')
if [ -z "$original_number" ]; then
    echo "Error: Filename must start with a numeric prefix."
    exit 1
fi

# Count CREATE TABLE statements and log them
create_table_count=$(grep -i -c "^CREATE TABLE " "$target_file")
if [ "$create_table_count" -eq 0 ]; then
    echo "No CREATE TABLE statements found in $target_file."
    exit 0
fi

echo "Found $create_table_count CREATE TABLE statements in $target_file."

# Calculate how much to increment subsequent file numbers
increment=$((create_table_count - 1))

# Rename subsequent files to make space for the new ones
for file in $(ls | grep -E '^[0-9]+_.*\.sql$' | sort -n -t_ -k1); do
    file_number=$(echo "$file" | grep -oE '^[0-9]+')
    if [ "$file_number" -gt "$original_number" ]; then
        new_number=$(printf "%04d" $((10#$file_number + increment)))
        new_name="${file/$file_number/$new_number}"
        mv "$file" "$new_name"
        echo "Renamed $file -> $new_name"
    fi
done

# Process the target file
new_file_index=$((10#$original_number))  # Ensure correct numeric interpretation
echo "Processing $target_file... at $new_file_index"
type_statements=""
current_table=""
while IFS= read -r line; do
    if [[ "$line" =~ ^CREATE\ TYPE ]]; then
        type_statements+="$line
"
    elif [[ "$line" =~ ^CREATE\ TABLE ]]; then
        # Ensure IF NOT EXISTS
        if [[ ! "$line" =~ IF\ NOT\ EXISTS ]]; then
            line=$(echo "$line" | sed 's/CREATE TABLE /CREATE TABLE IF NOT EXISTS /')
        fi
        # Extract table name
        table_name=$(echo "$line" | sed -E 's/.*CREATE TABLE (IF NOT EXISTS )?([a-zA-Z0-9_]+).*/\2/')

        new_file_name=$(printf "%04d_create_table_%s.sql" "$new_file_index" "$table_name")
        echo "$line" > "$new_file_name"
        echo "Created $new_file_name"
        current_table="$new_file_name"
        new_file_index=$((new_file_index + 1))
    elif [ -n "$current_table" ]; then
        # Append other statements to the last created file
        echo "$line" >> "$current_table"
    fi

done < "$target_file"

# If there were CREATE TYPE statements, move them to the first new file
if [ -n "$type_statements" ]; then
    first_file=$(ls | grep -E "^$(printf '%04d' "$original_number")_create_table_.*\.sql" | head -n 1)
    if [ -n "$first_file" ]; then
        echo -e "$type_statements" | cat - "$first_file" > temp && mv temp "$first_file"
        echo "Moved CREATE TYPE statements to $first_file"
    fi
fi

echo "Processing complete."
