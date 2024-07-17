# Find all files named "generateDoc.ts" in the current directory and its subdirectories
$files = Get-ChildItem -Recurse -Filter generateDoc.ts

# Loop through each file and execute ts-node
foreach ($file in $files) {
    & npx ts-node $file.FullName
}