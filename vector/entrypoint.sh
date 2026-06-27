#!/bin/sh
set -e

# Start BusyBox crond daemon in background (-d 8 = errors only)
crond -d 8

# Replace shell with vector, passing through all CMD arguments
exec /usr/local/bin/vector "$@"
