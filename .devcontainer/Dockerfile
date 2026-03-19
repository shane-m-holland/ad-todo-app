FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Avoid prompts during apt operations
ENV DEBIAN_FRONTEND=noninteractive

# Disable apt repository expiration check to avoid issues with clock synchronization
RUN echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until

# Install base dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    wget \
    git \
    jq \
    unzip \
    apt-transport-https \
    gnupg \
    lsb-release \
    iptables \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    mv /root/.local/bin/uv /usr/local/bin/uv && \
    mv /root/.local/bin/uvx /usr/local/bin/uvx

RUN uv python --native-tls install 3.13

# Install Node.js and npm
# Using NodeSource repository for latest Node.js LTS (v20.x)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright browsers and system dependencies
# This installs chromium, firefox, and webkit along with all required system libraries
RUN npx -y playwright@latest install --with-deps

# Install Docker Engine (full daemon for Docker-in-Docker)
# Pinned to version 29.1.4 for reproducible builds
ENV DOCKER_VERSION=5:29.1.4-1~ubuntu.24.04~noble
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-cache madison docker-ce | head -5 \
    && apt-get install -y \
    docker-ce=${DOCKER_VERSION} \
    docker-ce-cli=${DOCKER_VERSION} \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin \
    && rm -rf /var/lib/apt/lists/*

# Create docker group and add vscode user to it (for Docker-in-Docker)
RUN groupadd -f docker && usermod -aG docker root

# Copy runtime scripts and configuration into the image
RUN mkdir -p /opt/devcontainer/scripts /var/log
COPY scripts/ /opt/devcontainer/scripts/
RUN chmod +x /opt/devcontainer/scripts/*.sh


ENV DEBIAN_FRONTEND=dialog