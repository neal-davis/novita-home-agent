# Base image for building Node.js projects with pre-installed dependencies
FROM node:18.20-alpine3.19 AS build

# Set the working directory
WORKDIR /app

# Copy only the package.json and package-lock.json to the image
COPY package.json package-lock.json ./

# Set the npm registry and install global pnpm
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.cloud.tencent.com/g' /etc/apk/repositories && \
    apk add --no-cache libc6-compat && \
    npm config set registry https://registry.npmmirror.com/ && \
    npm ci && \
    rm -rf /root/.npm

# Use a smaller base image for the final stage
FROM node:18.20-alpine3.19

# Copy the built application files from the previous stage
COPY --from=build /app /app

# Set the default working directory
WORKDIR /app
