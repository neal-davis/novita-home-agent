#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DOCKER_FILE="${SCRIPT_DIR}/Dockerfile"
IMAGE_NAME="ai-cloud-platform/ppinfra-home-nodejs-builder"
TAG="node18.20-alpine3.19"
CR_REGISTRY="ppio-harbor-registry.tencentcloudcr.com"

function check_registry_login() {
    local registry=$1
    # Attempt to login with empty password
    if echo "" | docker login "$registry" --username "no_user" --password-stdin > /dev/null 2>&1; then
        # If login succeeded with empty password, we're not actually logged in
        docker logout "$registry" > /dev/null 2>&1
        return 1
    elif timeout 3s docker login "$registry" > /dev/null 2>&1; then
        # Login succeeded without credentials, meaning we're already logged in
        return 0
    else
        # Login failed, we're not logged in
        return 1
    fi
}

function build_and_push() {   
    if check_registry_login "$CR_REGISTRY"; then
        echo "Already logged into $CR_REGISTRY"
    else
        echo "Not logged into $CR_REGISTRY. Please login first, using command like: docker login $CR_REGISTRY --username {CR_USERNAME} --password {CR_PASSWORD}"
        exit 0
    fi

    DOCKER_IMAGE_NAME="$IMAGE_NAME:$TAG"
    echo "Build $DOCKER_FILE to $DOCKER_IMAGE_NAME"
    docker build -f $DOCKER_FILE --platform linux/amd64 -t $DOCKER_IMAGE_NAME . || exit 1

    echo "Tag $CR_REGISTRY/$DOCKER_IMAGE_NAME"
    docker tag $DOCKER_IMAGE_NAME $CR_REGISTRY/$DOCKER_IMAGE_NAME || exit 1

    echo "Push $CR_REGISTRY/$DOCKER_IMAGE_NAME"
    docker push $CR_REGISTRY/$DOCKER_IMAGE_NAME || exit 1
}

build_and_push
