FROM ubuntu:24.04

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

# Create unprivileged player user with credentials carved in Stage 6
RUN useradd -m -s /bin/bash player && \
    echo "player:AegisAccess#2026" | chpasswd

# Setup flag in root directory (mode 600, only readable by root)
RUN echo "CTF{r00t_pr1v_3sc4l4t10n_d0n3}" > /root/flag.txt && \
    chmod 600 /root/flag.txt && \
    chown root:root /root/flag.txt

# Create simulated incident clue in player home
COPY NOTE_FROM_SECOPS.txt /home/player/NOTE_FROM_SECOPS.txt
RUN chown player:player /home/player/NOTE_FROM_SECOPS.txt

# Copy halt_console to /opt/halt_console (executable only by root, but visible)
COPY halt_console /opt/halt_console
RUN chmod 755 /opt/halt_console && \
    chown root:root /opt/halt_console

# Intended Privilege Escalation Flaw: GTFOBins sudo find capability
# player can run /usr/bin/find as root without a password
RUN echo "player ALL=(root) NOPASSWD: /usr/bin/find" > /etc/sudoers.d/player && \
    chmod 0440 /etc/sudoers.d/player

# Configure SSH
RUN mkdir /var/run/sshd && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Setup web-based terminal interface
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./

EXPOSE 22 8086

CMD ["/bin/bash", "-c", "service ssh start && node /app/server.js"]
