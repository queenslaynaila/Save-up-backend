#!/bin/bash

find routes -name "generateDoc.ts" | while read file; do
  npx ts-node "$file"
done