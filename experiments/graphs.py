import matplotlib.pyplot as plt

# --- Data from your experiments ---
runs = [1, 2, 3]
block_rates = [42.49, 57.28, 47.93]

total_requests = [346, 323, 338]
blocked_requests = [147, 185, 162]

# -------------------------------
# Graph 1: Block Rate per Simulation
# -------------------------------
plt.figure()
plt.bar(runs, block_rates)
plt.xlabel("Simulation Run")
plt.ylabel("Block Rate (%)")
plt.title("Block Rate Across Simulations")
plt.xticks(runs)

# Save graph
plt.savefig("experiments/block_rate.png")
plt.show()

# -------------------------------
# Graph 2: Total vs Blocked Requests
# -------------------------------
plt.figure()

x = range(len(runs))
width = 0.4

plt.bar([i - width/2 for i in x], total_requests, width=width, label="Total")
plt.bar([i + width/2 for i in x], blocked_requests, width=width, label="Blocked")

plt.xlabel("Simulation Run")
plt.ylabel("Requests")
plt.title("Total vs Blocked Requests")
plt.xticks(x, runs)
plt.legend()

# Save graph
plt.savefig("experiments/requests_comparison.png")
plt.show()

# -------------------------------
# Graph 3: Normal vs Burst Users
# -------------------------------

user_types = ["Normal Users", "Burst Users"]

avg_sent = [7.4, 95.3]
avg_blocked = [4.1, 44.3]

x = range(len(user_types))
width = 0.4

plt.figure()

plt.bar([i - width/2 for i in x], avg_sent, width=width, label="Avg Sent")
plt.bar([i + width/2 for i in x], avg_blocked, width=width, label="Avg Blocked")

plt.xlabel("User Type")
plt.ylabel("Requests")
plt.title("Impact of User Behavior on Rate Limiting")
plt.xticks(x, user_types)
plt.legend()

# Save graph
plt.savefig("experiments/user_type_impact.png")
plt.show()

# -------------------------------
# Graph 4 Per User Line Graph
# -------------------------------

users = list(range(1, 11))

sent = [6, 9, 8, 9, 7, 7, 6, 154, 33, 99]
blocked = [3, 5, 4, 5, 4, 4, 4, 78, 5, 50]

plt.figure()

plt.plot(users, sent, marker='o', label="Sent")
plt.plot(users, blocked, marker='o', label="Blocked")

plt.xlabel("User ID")
plt.ylabel("Requests")
plt.title("Per-User Request Behavior")
plt.legend()

plt.savefig("experiments/per_user_line.png")
plt.show()