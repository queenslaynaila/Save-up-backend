set -e

# Download migrations script
rm -f ./run-migrations
curl -O -L -J  https://github.com/musyoka-morris/sql-migrations/releases/download/latest/run-migrations
chmod +x ./run-migrations

# Run migrations
export $(grep -v '^#' .env.migrations | xargs -d '\n')
export DIR=./migrations
export DANGEROUSLY_OVERWRITE_HASHES=0
./run-migrations