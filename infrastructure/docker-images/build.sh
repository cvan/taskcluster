#! /bin/bash

repo_root=$(dirname "$0")/../..
node_version=$(jq -r .engines.node "${repo_root}/package.json")
if [ -z "${node_version}" ]; then
    echo "Could not determine node version from top-level package.json"
    exit 1
fi

# First we do the browser-test image

tmpdir=$(mktemp -d)
trap "cd /; rm -rf ${tmpdir}" EXIT
cat > ${tmpdir}/Dockerfile <<EOF
FROM node:${node_version}-stretch
RUN apt-get update && apt-get install -y firefox-esr xvfb
EOF

docker build -t "taskcluster/browser-test:${node_version}" ${tmpdir}

# Next we do the rabbit-test image

tmpdir=$(mktemp -d)
trap "cd /; rm -rf ${tmpdir}" EXIT
cat > ${tmpdir}/Dockerfile <<EOF
FROM node:${node_version}-stretch
RUN apt-get update && apt-get install -y rabbitmq-server
EOF

docker build -t "taskcluster/rabbit-test:${node_version}" ${tmpdir}
