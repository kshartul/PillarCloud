#!/usr/bin/env python3
"""Generate SVG architecture diagrams for PillarCloud README."""
import os

OUT = os.path.dirname(os.path.abspath(__file__))


def write(name, svg):
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(svg)
    print(f"  Created {path}")


# ---------------------------------------------------------------------------
# 1. High-Level Architecture
# ---------------------------------------------------------------------------
write("architecture-overview.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 620" font-family="Segoe UI,Roboto,sans-serif">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f0f4ff"/><stop offset="100%" stop-color="#e8eef8"/></linearGradient>
    <linearGradient id="hdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1a3a6c"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>
    <filter id="sh"><feDropShadow dx="1" dy="2" stdDeviation="3" flood-opacity="0.12"/></filter>
    <style>
      .box{rx:10;filter:url(#sh)}.svc{fill:#fff;stroke:#cbd5e1;stroke-width:1.5}.infra{fill:#fef3c7;stroke:#f59e0b;stroke-width:1.5}
      .title{font-size:13px;font-weight:700;fill:#1e293b}.sub{font-size:10px;fill:#64748b}.port{font-size:9px;fill:#94a3b8}
      .arrow{stroke:#94a3b8;stroke-width:1.5;fill:none;marker-end:url(#arrowhead)}
      .zone-label{font-size:11px;font-weight:600;fill:#475569;text-transform:uppercase;letter-spacing:1px}
    </style>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker>
  </defs>
  <rect width="900" height="620" fill="url(#bg)" rx="12"/>
  <!-- Header -->
  <rect x="0" y="0" width="900" height="52" fill="url(#hdr)" rx="12"/>
  <rect x="0" y="30" width="900" height="22" fill="url(#hdr)"/>
  <text x="450" y="33" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">PillarCloud - Platform Architecture</text>

  <!-- Client -->
  <rect x="370" y="68" width="160" height="42" class="box svc"/>
  <text x="450" y="86" text-anchor="middle" class="title">Browser / Client</text>
  <text x="450" y="100" text-anchor="middle" class="sub">HTTPS</text>
  <line x1="450" y1="110" x2="450" y2="132" class="arrow"/>

  <!-- Frontend -->
  <rect x="345" y="132" width="210" height="48" class="box svc"/>
  <text x="450" y="152" text-anchor="middle" class="title">Frontend (React + MUI)</text>
  <text x="450" y="166" text-anchor="middle" class="sub">Nginx :80 | TypeScript + Vite</text>
  <line x1="450" y1="180" x2="450" y2="204" class="arrow"/>

  <!-- API Gateway -->
  <rect x="320" y="204" width="260" height="48" class="box" style="fill:#dbeafe;stroke:#3b82f6;stroke-width:2"/>
  <text x="450" y="224" text-anchor="middle" class="title">API Gateway (Express.js)</text>
  <text x="450" y="238" text-anchor="middle" class="sub">:3000 | JWT Auth | Rate Limiting | Routing</text>

  <!-- Zone: Services -->
  <rect x="20" y="272" width="860" height="140" rx="8" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="35" y="288" class="zone-label">Application Services</text>

  <!-- Auth -->
  <rect x="35" y="298" width="155" height="50" class="box svc"/>
  <text x="112" y="318" text-anchor="middle" class="title">Auth Service</text>
  <text x="112" y="332" text-anchor="middle" class="sub">Node.js :3001</text>

  <!-- Admin -->
  <rect x="205" y="298" width="155" height="50" class="box svc"/>
  <text x="282" y="318" text-anchor="middle" class="title">Admin Service</text>
  <text x="282" y="332" text-anchor="middle" class="sub">FastAPI :8001</text>

  <!-- Cloud -->
  <rect x="375" y="298" width="155" height="50" class="box svc"/>
  <text x="452" y="318" text-anchor="middle" class="title">Cloud Service</text>
  <text x="452" y="332" text-anchor="middle" class="sub">FastAPI :8002</text>

  <!-- Billing -->
  <rect x="545" y="298" width="155" height="50" class="box svc"/>
  <text x="622" y="318" text-anchor="middle" class="title">Billing Service</text>
  <text x="622" y="332" text-anchor="middle" class="sub">Node.js :3002</text>

  <!-- Notification -->
  <rect x="715" y="298" width="155" height="50" class="box svc"/>
  <text x="792" y="318" text-anchor="middle" class="title">Notification Svc</text>
  <text x="792" y="332" text-anchor="middle" class="sub">Node.js :3003</text>

  <!-- Arrows from gateway to services -->
  <line x1="380" y1="252" x2="112" y2="298" class="arrow"/>
  <line x1="420" y1="252" x2="282" y2="298" class="arrow"/>
  <line x1="450" y1="252" x2="452" y2="298" class="arrow"/>
  <line x1="480" y1="252" x2="622" y2="298" class="arrow"/>
  <line x1="520" y1="252" x2="792" y2="298" class="arrow"/>

  <!-- Zone: Infrastructure -->
  <rect x="20" y="432" width="540" height="80" rx="8" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="35" y="448" class="zone-label">Data & Messaging Layer</text>

  <rect x="35" y="458" width="155" height="44" class="box infra"/>
  <text x="112" y="476" text-anchor="middle" class="title">PostgreSQL 15</text>
  <text x="112" y="490" text-anchor="middle" class="sub">:5432 | Primary DB</text>

  <rect x="205" y="458" width="155" height="44" class="box infra"/>
  <text x="282" y="476" text-anchor="middle" class="title">Redis 7</text>
  <text x="282" y="490" text-anchor="middle" class="sub">:6379 | Cache</text>

  <rect x="375" y="458" width="170" height="44" class="box infra"/>
  <text x="460" y="476" text-anchor="middle" class="title">RabbitMQ 3</text>
  <text x="460" y="490" text-anchor="middle" class="sub">:5672 | Message Queue</text>

  <!-- Arrows services to infra -->
  <line x1="112" y1="348" x2="112" y2="458" class="arrow"/>
  <line x1="282" y1="348" x2="282" y2="458" class="arrow"/>
  <line x1="622" y1="348" x2="460" y2="458" class="arrow"/>
  <line x1="792" y1="348" x2="460" y2="458" class="arrow"/>
  <line x1="112" y1="370" x2="282" y2="458" class="arrow" stroke-dasharray="4,3"/>

  <!-- OpenStack Zone -->
  <rect x="590" y="432" width="280" height="80" rx="8" fill="none" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="6,3"/>
  <text x="605" y="448" class="zone-label">OpenStack APIs</text>
  <rect x="605" y="458" width="250" height="44" class="box" style="fill:#f5f3ff;stroke:#8b5cf6;stroke-width:1.5"/>
  <text x="730" y="476" text-anchor="middle" class="title">Keystone | Nova | Neutron</text>
  <text x="730" y="490" text-anchor="middle" class="sub">Cinder | Glance | Swift | Heat + 12 more</text>
  <line x1="452" y1="348" x2="700" y2="458" class="arrow"/>

  <!-- Legend -->
  <rect x="20" y="535" width="860" height="70" rx="8" fill="#fff" stroke="#e2e8f0" stroke-width="1" filter="url(#sh)"/>
  <text x="40" y="555" class="zone-label">Legend</text>
  <rect x="40" y="565" width="14" height="14" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" rx="3"/>
  <text x="60" y="576" class="sub">API Gateway</text>
  <rect x="160" y="565" width="14" height="14" fill="#fff" stroke="#cbd5e1" stroke-width="1.5" rx="3"/>
  <text x="180" y="576" class="sub">Microservice</text>
  <rect x="290" y="565" width="14" height="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" rx="3"/>
  <text x="310" y="576" class="sub">Infrastructure</text>
  <rect x="420" y="565" width="14" height="14" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5" rx="3"/>
  <text x="440" y="576" class="sub">External (OpenStack)</text>
  <line x1="580" y1="572" x2="610" y2="572" class="arrow"/>
  <text x="620" y="576" class="sub">Request Flow</text>
  <line x1="720" y1="572" x2="750" y2="572" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="760" y="576" class="sub">Cache/Async</text>
</svg>''')


# ---------------------------------------------------------------------------
# 2. Deployment Topology (Dev vs Prod)
# ---------------------------------------------------------------------------
write("deployment-topology.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" font-family="Segoe UI,Roboto,sans-serif">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#f1f5f9"/></linearGradient>
    <linearGradient id="devhdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#34d399"/></linearGradient>
    <linearGradient id="prodhdr" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#dc2626"/><stop offset="100%" stop-color="#f87171"/></linearGradient>
    <filter id="sh2"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.10"/></filter>
    <style>
      .bx{rx:8;filter:url(#sh2)}.t{font-size:12px;font-weight:700;fill:#1e293b}.s{font-size:9px;fill:#64748b}
    </style>
  </defs>
  <rect width="900" height="480" fill="url(#bg2)" rx="12"/>
  <text x="450" y="30" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">Deployment Topology Comparison</text>

  <!-- DEV SIDE -->
  <rect x="20" y="50" width="420" height="410" rx="10" fill="#f0fdf4" stroke="#86efac" stroke-width="1.5"/>
  <rect x="20" y="50" width="420" height="36" rx="10" fill="url(#devhdr)"/>
  <rect x="20" y="72" width="420" height="14" fill="url(#devhdr)"/>
  <text x="230" y="74" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">Development Environment</text>
  <text x="230" y="108" text-anchor="middle" class="s">Docker Compose | Single Node | No HA</text>

  <!-- Dev boxes -->
  <rect x="40" y="124" width="380" height="36" class="bx" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="230" y="146" text-anchor="middle" class="t">docker compose up --build -d</text>

  <rect x="55" y="174" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="110" y="194" text-anchor="middle" class="s">Frontend :80</text>
  <rect x="175" y="174" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="230" y="194" text-anchor="middle" class="s">API Gateway :3000</text>
  <rect x="295" y="174" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="350" y="194" text-anchor="middle" class="s">Auth Svc :3001</text>

  <rect x="55" y="216" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="110" y="236" text-anchor="middle" class="s">Admin Svc :8001</text>
  <rect x="175" y="216" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="230" y="236" text-anchor="middle" class="s">Cloud Svc :8002</text>
  <rect x="295" y="216" width="110" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="350" y="236" text-anchor="middle" class="s">Billing Svc :3002</text>

  <rect x="130" y="258" width="200" height="32" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="230" y="278" text-anchor="middle" class="s">Notification Service :3003</text>

  <!-- Dev Infra -->
  <rect x="40" y="306" width="380" height="56" rx="6" fill="#fffbeb" stroke="#fbbf24"/>
  <text x="230" y="322" text-anchor="middle" font-size="10" font-weight="600" fill="#92400e">Infrastructure (Docker Volumes)</text>
  <text x="100" y="348" text-anchor="middle" class="s">PostgreSQL :5432</text>
  <text x="230" y="348" text-anchor="middle" class="s">Redis :6379</text>
  <text x="360" y="348" text-anchor="middle" class="s">RabbitMQ :5672</text>

  <rect x="40" y="376" width="380" height="36" rx="6" fill="#f5f3ff" stroke="#8b5cf6"/>
  <text x="230" y="398" text-anchor="middle" class="s">bridge network: portal-net</text>

  <text x="230" y="438" text-anchor="middle" font-size="11" font-weight="600" fill="#059669">localhost access | .env config | Hot-reload</text>

  <!-- PROD SIDE -->
  <rect x="460" y="50" width="420" height="410" rx="10" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.5"/>
  <rect x="460" y="50" width="420" height="36" rx="10" fill="url(#prodhdr)"/>
  <rect x="460" y="72" width="420" height="14" fill="url(#prodhdr)"/>
  <text x="670" y="74" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">Production Environment</text>
  <text x="670" y="108" text-anchor="middle" class="s">Kubernetes | Multi-Node HA | TLS + WAF</text>

  <!-- Prod: Customer NS -->
  <rect x="475" y="120" width="195" height="200" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-dasharray="4,2"/>
  <text x="572" y="138" text-anchor="middle" font-size="10" font-weight="700" fill="#1d4ed8">ns: pillarcloud</text>
  <rect x="485" y="146" width="90" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="530" y="162" text-anchor="middle" class="s">Frontend x2</text>
  <rect x="485" y="176" width="90" height="24" class="bx" fill="#dbeafe" stroke="#3b82f6"/><text x="530" y="192" text-anchor="middle" class="s">API GW x3</text>
  <rect x="580" y="146" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="620" y="162" text-anchor="middle" class="s">Auth x3</text>
  <rect x="580" y="176" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="620" y="192" text-anchor="middle" class="s">Cloud x3</text>
  <rect x="485" y="206" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="525" y="222" text-anchor="middle" class="s">Billing x2</text>
  <rect x="580" y="206" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="620" y="222" text-anchor="middle" class="s">Notif x2</text>
  <rect x="485" y="240" width="175" height="28" rx="4" fill="#fffbeb" stroke="#fbbf24"/>
  <text x="572" y="258" text-anchor="middle" class="s">PG HA (3) | Redis Sentinel | RMQ Cluster</text>
  <rect x="485" y="276" width="175" height="24" rx="4" fill="#ecfdf5" stroke="#34d399"/>
  <text x="572" y="292" text-anchor="middle" class="s">HPA: 2-10 replicas | Anti-affinity</text>

  <!-- Prod: Admin NS -->
  <rect x="685" y="120" width="185" height="200" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-dasharray="4,2"/>
  <text x="777" y="138" text-anchor="middle" font-size="10" font-weight="700" fill="#dc2626">ns: pillarcloud-admin</text>
  <rect x="695" y="146" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="735" y="162" text-anchor="middle" class="s">Admin FE x2</text>
  <rect x="780" y="146" width="80" height="24" class="bx" fill="#fecaca" stroke="#f87171"/><text x="820" y="162" text-anchor="middle" class="s">Admin GW x2</text>
  <rect x="695" y="176" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="735" y="192" text-anchor="middle" class="s">Admin Svc x2</text>
  <rect x="780" y="176" width="80" height="24" class="bx" fill="#fff" stroke="#cbd5e1"/><text x="820" y="192" text-anchor="middle" class="s">Auth Svc x2</text>

  <rect x="695" y="212" width="165" height="24" rx="4" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="777" y="228" text-anchor="middle" class="s">VPN Only | MFA Required</text>
  <rect x="695" y="244" width="165" height="24" rx="4" fill="#fee2e2" stroke="#f87171"/>
  <text x="777" y="260" text-anchor="middle" class="s">NetworkPolicy: deny all public</text>
  <rect x="695" y="276" width="165" height="24" rx="4" fill="#f3e8ff" stroke="#a78bfa"/>
  <text x="777" y="292" text-anchor="middle" class="s">Separate secrets + JWT keys</text>

  <!-- Prod: Infra -->
  <rect x="475" y="336" width="395" height="44" rx="6" fill="#fffbeb" stroke="#fbbf24"/>
  <text x="672" y="354" text-anchor="middle" font-size="10" font-weight="600" fill="#92400e">Shared Infrastructure (Encrypted Storage, HA)</text>
  <text x="672" y="370" text-anchor="middle" class="s">CloudNativePG (3-node) | Redis Sentinel (3) | RabbitMQ Cluster (3) | S3 Backups</text>

  <!-- Prod: Bottom -->
  <rect x="475" y="394" width="190" height="28" rx="4" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="570" y="412" text-anchor="middle" class="s">Ingress TLS :443 (public)</text>
  <rect x="680" y="394" width="190" height="28" rx="4" fill="#fecaca" stroke="#f87171"/>
  <text x="775" y="412" text-anchor="middle" class="s">Ingress VPN :443 (internal)</text>

  <text x="670" y="448" text-anchor="middle" font-size="11" font-weight="600" fill="#dc2626">cert-manager | WAF | NetworkPolicies | Vault</text>
</svg>''')


# ---------------------------------------------------------------------------
# 3. Admin Isolation Diagram
# ---------------------------------------------------------------------------
write("admin-isolation.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" font-family="Segoe UI,Roboto,sans-serif">
  <defs>
    <filter id="sh3"><feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.10"/></filter>
    <style>.t3{font-size:12px;font-weight:700;fill:#1e293b}.s3{font-size:9px;fill:#64748b}.bx3{rx:8;filter:url(#sh3)}</style>
    <marker id="ah3" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#94a3b8"/></marker>
    <marker id="block" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto"><circle cx="5" cy="5" r="4" fill="#ef4444" stroke="#fff" stroke-width="1"/></marker>
  </defs>
  <rect width="800" height="400" fill="#f8fafc" rx="10"/>
  <text x="400" y="28" text-anchor="middle" font-size="15" font-weight="700" fill="#1e293b">Admin Portal - Network Isolation Architecture</text>

  <!-- Internet -->
  <rect x="20" y="52" width="120" height="44" class="bx3" fill="#e0f2fe" stroke="#0ea5e9"/><text x="80" y="72" text-anchor="middle" class="t3">Internet</text><text x="80" y="86" text-anchor="middle" class="s3">Public Users</text>

  <!-- VPN -->
  <rect x="20" y="160" width="120" height="44" class="bx3" fill="#fef3c7" stroke="#f59e0b"/><text x="80" y="180" text-anchor="middle" class="t3">VPN Gateway</text><text x="80" y="194" text-anchor="middle" class="s3">Admin Staff Only</text>

  <!-- WAF/LB -->
  <rect x="190" y="52" width="130" height="44" class="bx3" fill="#dbeafe" stroke="#3b82f6"/><text x="255" y="72" text-anchor="middle" class="t3">WAF + LB</text><text x="255" y="86" text-anchor="middle" class="s3">TLS 1.3 | ModSecurity</text>
  <line x1="140" y1="74" x2="190" y2="74" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ah3)"/>

  <!-- Customer Portal -->
  <rect x="370" y="40" width="220" height="80" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" filter="url(#sh3)"/>
  <text x="480" y="62" text-anchor="middle" class="t3" fill="#1d4ed8">Customer Portal</text>
  <text x="480" y="78" text-anchor="middle" class="s3">ns: pillarcloud</text>
  <text x="480" y="92" text-anchor="middle" class="s3">Frontend | API GW | All Services</text>
  <text x="480" y="106" text-anchor="middle" class="s3">portal.example.com</text>
  <line x1="320" y1="74" x2="370" y2="74" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ah3)"/>

  <!-- Admin Portal -->
  <rect x="370" y="148" width="220" height="80" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="2" filter="url(#sh3)"/>
  <text x="480" y="170" text-anchor="middle" class="t3" fill="#dc2626">Admin Portal (Isolated)</text>
  <text x="480" y="186" text-anchor="middle" class="s3">ns: pillarcloud-admin</text>
  <text x="480" y="200" text-anchor="middle" class="s3">Admin FE | Admin GW | Admin Svc</text>
  <text x="480" y="214" text-anchor="middle" class="s3">admin.internal.example.com</text>
  <line x1="140" y1="182" x2="370" y2="188" stroke="#f59e0b" stroke-width="2" marker-end="url(#ah3)"/>

  <!-- BLOCKED: Internet to Admin -->
  <line x1="255" y1="96" x2="380" y2="155" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#block)"/>
  <text x="290" y="128" font-size="11" font-weight="700" fill="#ef4444" transform="rotate(-18,290,128)">BLOCKED</text>

  <!-- Data Zone -->
  <rect x="340" y="268" width="280" height="60" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" filter="url(#sh3)"/>
  <text x="480" y="290" text-anchor="middle" class="t3">Shared Data Zone</text>
  <text x="480" y="306" text-anchor="middle" class="s3">PostgreSQL HA | Redis | RabbitMQ (mTLS enforced)</text>
  <text x="480" y="318" text-anchor="middle" class="s3">Separate databases + credentials per portal</text>
  <line x1="480" y1="120" x2="480" y2="268" stroke="#94a3b8" stroke-width="1" marker-end="url(#ah3)"/>
  <line x1="480" y1="228" x2="480" y2="268" stroke="#94a3b8" stroke-width="1" marker-end="url(#ah3)"/>

  <!-- Security Labels -->
  <rect x="640" y="52" width="140" height="100" rx="6" fill="#f0fdf4" stroke="#22c55e" filter="url(#sh3)"/>
  <text x="710" y="70" text-anchor="middle" font-size="10" font-weight="700" fill="#166534">Security Controls</text>
  <text x="652" y="88" class="s3">- MFA Required (Admin)</text>
  <text x="652" y="102" class="s3">- 8h Session TTL</text>
  <text x="652" y="116" class="s3">- IP Allowlisting</text>
  <text x="652" y="130" class="s3">- Separate JWT Keys</text>
  <text x="652" y="144" class="s3">- Full Audit Trail</text>

  <!-- Network Policies box -->
  <rect x="640" y="168" width="140" height="80" rx="6" fill="#fef2f2" stroke="#ef4444" filter="url(#sh3)"/>
  <text x="710" y="186" text-anchor="middle" font-size="10" font-weight="700" fill="#991b1b">Network Policies</text>
  <text x="652" y="204" class="s3">- Default deny all</text>
  <text x="652" y="218" class="s3">- VPN CIDR only ingress</text>
  <text x="652" y="232" class="s3">- No cross-NS traffic</text>

  <!-- Legend -->
  <rect x="20" y="350" width="760" height="36" rx="6" fill="#fff" stroke="#e2e8f0"/>
  <line x1="40" y1="370" x2="70" y2="370" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ah3)"/>
  <text x="80" y="374" class="s3">Allowed Traffic</text>
  <line x1="200" y1="370" x2="230" y2="370" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#block)"/>
  <text x="240" y="374" class="s3">Blocked Traffic</text>
  <line x1="380" y1="370" x2="410" y2="370" stroke="#f59e0b" stroke-width="2" marker-end="url(#ah3)"/>
  <text x="420" y="374" class="s3">VPN-Only Path</text>
  <rect x="560" y="364" width="12" height="12" fill="#eff6ff" stroke="#3b82f6" rx="2"/><text x="580" y="374" class="s3">Customer NS</text>
  <rect x="670" y="364" width="12" height="12" fill="#fef2f2" stroke="#ef4444" rx="2"/><text x="690" y="374" class="s3">Admin NS</text>
</svg>''')


# ---------------------------------------------------------------------------
# 4. Tech Stack Overview
# ---------------------------------------------------------------------------
write("tech-stack.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" font-family="Segoe UI,Roboto,sans-serif">
  <defs>
    <filter id="sh4"><feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.08"/></filter>
    <style>.t4{font-size:12px;font-weight:700;fill:#1e293b}.s4{font-size:9px;fill:#64748b}.bx4{rx:8;filter:url(#sh4)}</style>
  </defs>
  <rect width="800" height="320" fill="#f8fafc" rx="10"/>
  <text x="400" y="28" text-anchor="middle" font-size="15" font-weight="700" fill="#1e293b">Technology Stack</text>

  <!-- Frontend -->
  <rect x="20" y="48" width="180" height="110" class="bx4" fill="#eff6ff" stroke="#3b82f6"/>
  <text x="110" y="68" text-anchor="middle" class="t4" fill="#1d4ed8">Frontend</text>
  <text x="110" y="86" text-anchor="middle" class="s4">React 18 + TypeScript</text>
  <text x="110" y="100" text-anchor="middle" class="s4">Material UI (MUI) v5</text>
  <text x="110" y="114" text-anchor="middle" class="s4">Redux Toolkit</text>
  <text x="110" y="128" text-anchor="middle" class="s4">Vite + React Router</text>
  <text x="110" y="142" text-anchor="middle" class="s4">Recharts | Axios</text>

  <!-- Node.js Services -->
  <rect x="215" y="48" width="180" height="110" class="bx4" fill="#f0fdf4" stroke="#22c55e"/>
  <text x="305" y="68" text-anchor="middle" class="t4" fill="#166534">Node.js Services</text>
  <text x="305" y="86" text-anchor="middle" class="s4">Express.js</text>
  <text x="305" y="100" text-anchor="middle" class="s4">JWT (jsonwebtoken)</text>
  <text x="305" y="114" text-anchor="middle" class="s4">express-rate-limit</text>
  <text x="305" y="128" text-anchor="middle" class="s4">Winston + Morgan logging</text>
  <text x="305" y="142" text-anchor="middle" class="s4">node-cron | nodemailer</text>

  <!-- Python Services -->
  <rect x="410" y="48" width="180" height="110" class="bx4" fill="#fefce8" stroke="#eab308"/>
  <text x="500" y="68" text-anchor="middle" class="t4" fill="#854d0e">Python Services</text>
  <text x="500" y="86" text-anchor="middle" class="s4">FastAPI + Uvicorn</text>
  <text x="500" y="100" text-anchor="middle" class="s4">OpenStack SDK</text>
  <text x="500" y="114" text-anchor="middle" class="s4">SQLAlchemy + Alembic</text>
  <text x="500" y="128" text-anchor="middle" class="s4">Pydantic validation</text>
  <text x="500" y="142" text-anchor="middle" class="s4">python-jose (JWT)</text>

  <!-- Infrastructure -->
  <rect x="605" y="48" width="180" height="110" class="bx4" fill="#fef2f2" stroke="#ef4444"/>
  <text x="695" y="68" text-anchor="middle" class="t4" fill="#991b1b">Infrastructure</text>
  <text x="695" y="86" text-anchor="middle" class="s4">PostgreSQL 15</text>
  <text x="695" y="100" text-anchor="middle" class="s4">Redis 7</text>
  <text x="695" y="114" text-anchor="middle" class="s4">RabbitMQ 3</text>
  <text x="695" y="128" text-anchor="middle" class="s4">Nginx (reverse proxy)</text>
  <text x="695" y="142" text-anchor="middle" class="s4">Docker + Docker Compose</text>

  <!-- DevOps -->
  <rect x="20" y="180" width="375" height="60" class="bx4" fill="#f5f3ff" stroke="#8b5cf6"/>
  <text x="207" y="200" text-anchor="middle" class="t4" fill="#6d28d9">DevOps & Orchestration</text>
  <text x="207" y="218" text-anchor="middle" class="s4">Kubernetes | Kustomize | Helm | HPA | NGINX Ingress | cert-manager</text>
  <text x="207" y="232" text-anchor="middle" class="s4">Calico (NetworkPolicy) | ArgoCD (GitOps) | Velero (Backups)</text>

  <!-- Observability -->
  <rect x="410" y="180" width="375" height="60" class="bx4" fill="#ecfdf5" stroke="#10b981"/>
  <text x="597" y="200" text-anchor="middle" class="t4" fill="#065f46">Observability & Security</text>
  <text x="597" y="218" text-anchor="middle" class="s4">Prometheus + Grafana | Loki + Promtail | Jaeger (Tracing)</text>
  <text x="597" y="232" text-anchor="middle" class="s4">HashiCorp Vault | ModSecurity WAF | Istio mTLS</text>

  <!-- OpenStack -->
  <rect x="20" y="258" width="765" height="48" class="bx4" fill="#faf5ff" stroke="#a78bfa"/>
  <text x="402" y="278" text-anchor="middle" class="t4" fill="#6d28d9">OpenStack Integration (18 Services)</text>
  <text x="402" y="294" text-anchor="middle" class="s4">Keystone | Nova | Neutron | Cinder | Glance | Swift | Heat | Octavia | Barbican | Designate | Manila | Magnum | Trove | Sahara | Ironic | Zaqar | Mistral | Watcher</text>
</svg>''')


print("All diagrams generated successfully.")


if __name__ == "__main__":
    pass
