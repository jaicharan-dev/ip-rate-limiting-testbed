import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# -------------------------------
# Scenario 3 VPN SIMULATION
# -------------------------------

# -------------------------------
# LOAD DATA
# -------------------------------
file_path = "logs/vpn_simulation.log"  

data = []
with open(file_path, "r") as f:
    for line in f:
        try:
            data.append(json.loads(line))
        except:
            continue

df = pd.DataFrame(data)

# -------------------------------
# PREPROCESSING
# -------------------------------

# Convert timestamp
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Sort by time
df = df.sort_values(by='timestamp').reset_index(drop=True)

# Add request index
df['request_index'] = df.index

# Convert rateLimited to numeric
df['blocked'] = df['rateLimited'].astype(int)

# Fill missing vpnSession
df['vpnSession'] = df['vpnSession'].fillna("UNKNOWN")

# -------------------------------
# GRAPH 1 — TIMELINE (IMPROVED)
# -------------------------------

plt.figure(figsize=(10,5))

plt.plot(df['request_index'], df['blocked'], marker='o')

# mark IP change points
for i in range(1, len(df)):
    if df['ip'][i] != df['ip'][i-1]:
        plt.axvline(x=i, linestyle='--')

plt.title("Request Timeline with IP Changes")
plt.xlabel("Request Number")
plt.ylabel("Blocked (1) / Success (0)")

plt.tight_layout()
plt.savefig("graph1_timeline_improved.png")
plt.close()

# -------------------------------
# GRAPH 2 — IP Rotation + Status (FINAL)
# -------------------------------

plt.figure(figsize=(12,6))

# Plot points with meaningful colors
for i in range(len(df)):
    color = 'green' if df['blocked'][i] == 0 else 'red'
    plt.scatter(df['request_index'][i], df['ip'][i], color=color, s=60)

# Draw vertical lines where IP changes
for i in range(1, len(df)):
    if df['ip'][i] != df['ip'][i-1]:
        plt.axvline(x=i, linestyle='--', linewidth=1)

# Labels and title
plt.title("IP Rotation with Request Outcome", fontsize=14)
plt.xlabel("Request Number")
plt.ylabel("IP Address")

# Legend
green_patch = mpatches.Patch(color='green', label='Accepted')
red_patch = mpatches.Patch(color='red', label='Blocked')
plt.legend(handles=[green_patch, red_patch])

# Improve layout
plt.tight_layout()

# Save
plt.savefig("graph2_ip_rotation_final.png")
plt.close()