FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openssh-server \
    sudo \
    curl \
    python3 \
    nodejs \
    npm \
    net-tools \
    iputils-ping \
    nano \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged player user
RUN useradd -m -s /bin/bash player && \
    echo "player:player123" | chpasswd

# Setup flag in root directory (mode 600, only readable by root)
RUN echo "CTF{r00t_pr1v_3sc4l4t10n_d0n3}" > /root/flag.txt && \
    chmod 600 /root/flag.txt && \
    chown root:root /root/flag.txt

# Create simulated incident clue in player home
RUN echo "INCIDENT LOG: Server compromised by adversary. Administrator privileges locked. Investigate sudo permissions (sudo -l)." > /home/player/NOTE_FROM_SECOPS.txt && \
    chown player:player /home/player/NOTE_FROM_SECOPS.txt

# Intended Privilege Escalation Flaw: GTFOBins sudo find capability
# player can run /usr/bin/find as root without a password
RUN echo "player ALL=(root) NOPASSWD: /usr/bin/find" > /etc/sudoers.d/player && \
    chmod 0440 /etc/sudoers.d/player

# Configure SSH
RUN mkdir /var/run/sshd && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Setup web-based terminal interface for players who don't have SSH client
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.js ./

EXPOSE 22 8086

CMD ["/bin/bash", "-c", "service ssh start && node /app/server.js"]
