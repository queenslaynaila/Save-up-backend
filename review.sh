#!/bin/bash

MIGRATIONS_DIR="./migrations/migrations2"

# ANSI color codes for pretty printing
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No color

# Function to print error and exit immediately
exit_with_error() {
  echo -e "${RED}[ERROR] $1${NC}"
  exit 1
}

# Function to check if filename follows snake_case convention
check_snake_case() {
  local filename=$(basename -- "$1")

  # Extract part before ".mutable.sql" if present, otherwise use full filename
  local base_name="${filename%.mutable.sql}"
  base_name="${base_name%.sql}" # Ensure .sql is also removed if no .mutable

  # Check if the base_name follows snake_case convention
  if [[ ! "$base_name" =~ ^[0-9]{4}_[a-z0-9_]+$ ]]; then
    exit_with_error "File '$filename' does not follow snake_case naming convention."
  fi
}



# Function to check timestamp consistency
check_timestamp_consistency() {
  local file="$1"
  local has_now=$(grep -i "NOW()" "$file")
  local has_current_ts=$(grep -i "CURRENT_TIMESTAMP" "$file")
  local has_timestamptz=$(grep -i "TIMESTAMP WITH TIME ZONE" "$file")

  if [[ -n "$has_now" && (-n "$has_current_ts" || -n "$has_timestamptz") ]]; then
    exit_with_error "File '$file' uses mixed timestamp conventions (NOW(), CURRENT_TIMESTAMP, TIMESTAMP WITH TIME ZONE). Ensure consistency."
  fi
}

# File to store the first detected timestamp convention
TIMESTAMP_CONVENTION_FILE="./.timestamp_convention"

# Function to check timestamp consistency
check_timestamp_consistency() {
  local file="$1"
  
  # Detect timestamp usage in the current file
  local has_now=$(grep -i "NOW()" "$file")
  local has_current_ts=$(grep -i "CURRENT_TIMESTAMP" "$file")
  local has_timestamptz=$(grep -i "TIMESTAMP WITH TIME ZONE" "$file")

  # Determine which convention is used in this file
  local current_convention=""
  if [[ -n "$has_now" ]]; then
    current_convention="NOW()"
  elif [[ -n "$has_current_ts" ]]; then
    current_convention="CURRENT_TIMESTAMP"
  elif [[ -n "$has_timestamptz" ]]; then
    current_convention="TIMESTAMP WITH TIME ZONE"
  fi

  # If no convention is found, return early
  if [[ -z "$current_convention" ]]; then
    return 0
  fi

  # Check if a convention has already been set (from the first file)
  if [[ -f "$TIMESTAMP_CONVENTION_FILE" ]]; then
    local saved_convention=$(cat "$TIMESTAMP_CONVENTION_FILE")

    # If the current file uses a different convention than the first file, throw an error
    if [[ "$current_convention" != "$saved_convention" ]]; then
      exit_with_error "File '$file' uses mixed timestamp conventions. First file used '$saved_convention', but this file uses '$current_convention'. Ensure consistency."
    fi
  else
    # Save the first detected convention
    echo "$current_convention" > "$TIMESTAMP_CONVENTION_FILE"
  fi
}


# Function to check if CREATE TABLE has IF NOT EXISTS
check_create_table_if_not_exists() {
  local file="$1"
  if grep -iq "CREATE TABLE" "$file" && ! grep -iq "CREATE TABLE IF NOT EXISTS" "$file"; then
    exit_with_error "File '$file' has CREATE TABLE without IF NOT EXISTS."
  fi
}

# Function to check if a file defines multiple tables
check_multiple_tables() {
  local file="$1"
  local table_count=$(grep -i "CREATE TABLE" "$file" | wc -l)
  if [[ "$table_count" -gt 1 ]]; then
    exit_with_error "File '$file' defines more than one table. Split into separate files."
  fi
}

# Function to check if ENUMs are inside transactions
check_enum_transaction() {
  local file="$1"
  local has_enum=$(grep -i "CREATE TYPE" "$file")
  local has_transaction=$(grep -i "DO\s*\$\$" "$file")

  if [[ -n "$has_enum" && -z "$has_transaction" ]]; then
    exit_with_error "File '$file' defines ENUM without a transaction block. Wrap it in DO $$ BEGIN ... END $$;"
  fi
}

# Function to ensure ENUMs have '_enum' suffix
check_enum_naming() {
  local file="$1"
  if grep -iq "CREATE TYPE" "$file"; then
    local enum_name=$(grep -oP "CREATE TYPE \K\w+" "$file")
    if [[ ! "$enum_name" =~ _enum$ ]]; then
      exit_with_error "ENUM '$enum_name' in file '$file' should have '_enum' suffix."
    fi
  fi
}

# Function to ensure tables have a PRIMARY KEY
check_primary_key() {
  local file="$1"
  while read -r table; do
    local pk_count=$(grep -A5 -i "$table" "$file" | grep -i "PRIMARY KEY" | wc -l)
    if [[ "$pk_count" -eq 0 ]]; then
      exit_with_error "Table '$table' in file '$file' has no PRIMARY KEY."
    fi
  done < <(grep -oP "CREATE TABLE \K\w+" "$file")
}

# Function to check if NOT NULL columns have DEFAULT values
check_not_null_defaults() {
  local file="$1"
  if grep -iq "NOT NULL" "$file"; then
    while read -r line; do
      if echo "$line" | grep -iq "NOT NULL" && ! echo "$line" | grep -iq "DEFAULT"; then
        exit_with_error "File '$file' contains NOT NULL column without a DEFAULT value: '$line'."
      fi
    done < "$file"
  fi
}

# Function to check if CREATE FUNCTION uses CREATE OR REPLACE FUNCTION
check_create_function() {
  local file="$1"
  if grep -iq "CREATE FUNCTION" "$file" && ! grep -iq "CREATE OR REPLACE FUNCTION" "$file"; then
    exit_with_error "File '$file' has CREATE FUNCTION without CREATE OR REPLACE FUNCTION."
  fi
}

# Function to check if function names follow snake_case and start with fn_
check_function_naming() {
  local file="$1"
  if grep -iq "CREATE OR REPLACE FUNCTION" "$file"; then
    local function_name=$(grep -oP "CREATE OR REPLACE FUNCTION \K\w+" "$file")
    if [[ ! "$function_name" =~ ^fn_[a-z0-9_]+$ ]]; then
      exit_with_error "Function '$function_name' in file '$file' should start with 'fn_' and be in snake_case."
    fi
  fi
}

# Iterate over all migration files
for file in "$MIGRATIONS_DIR"/*.sql; do
  echo -e "${YELLOW}Checking: $file...${NC}"
  check_snake_case "$file"
  check_timestamp_consistency "$file"
  check_create_table_if_not_exists "$file"
  check_multiple_tables "$file"
  check_enum_transaction "$file"
  check_enum_naming "$file"
  check_primary_key "$file"
  check_not_null_defaults "$file"
  check_create_function "$file"
  check_function_naming "$file"
  
  # Ensure file names are descriptive
  if [[ "$file" =~ create_table ]]; then
    if ! grep -qi "CREATE TABLE" "$file"; then
      exit_with_error "File '$file' is named 'create_table' but does not create a table."
    fi
  fi
  if [[ "$file" =~ create_fn ]]; then
    if ! grep -qi "CREATE FUNCTION" "$file"; then
      exit_with_error "File '$file' is named 'create_fn' but does not define a function."
    fi
  fi

done

# If all checks pass
echo -e "${GREEN}✅ All migration files passed validation!${NC}"
exit 0
