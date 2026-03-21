from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import matplotlib.pyplot as plt


def project_root() -> Path:
    """
    Works whether this script is placed in the project root
    or inside the experiments/ folder.
    """
    here = Path(__file__).resolve()
    if here.parent.name == "experiments":
        return here.parent.parent
    return here.parent


ROOT = project_root()
LOG_DIR = ROOT / "logs"
OUT_DIR = ROOT / "experiments" / "graphs" / "scenario4"
OUT_DIR.mkdir(parents=True, exist_ok=True)


ATTACK_SPECS: List[Tuple[str, List[str]]] = [
    (
        "Single IP Attack",
        [
            "abuse_0_single_ip_attack.log",
            "single_ip_attack.log",
            "single_ip.log",
        ],
    ),
    (
        "Distributed Rotation",
        [
            "abuse_1_distributed.log",
            "abuse_1_distributed_attack.log",
            "abuse_0_distributed_attack.log",
            "distributed.log",
        ],
    ),
    (
        "VPN Rotation",
        [
            "abuse_2_vpn.log",
            "abuse_2_vpn_attack.log",
            "abuse_0_vpn_attack.log",
            "vpn.log",
        ],
    ),
]


def newest_existing_file(candidates: List[str]) -> Optional[Path]:
    existing = [LOG_DIR / name for name in candidates if (LOG_DIR / name).exists()]
    if not existing:
        return None
    return max(existing, key=lambda p: p.stat().st_mtime)


def load_jsonl(path: Path) -> List[Dict]:
    rows: List[Dict] = []
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                print(f"[WARN] Skipping malformed JSON line {line_no} in {path.name}")
    return rows


def summarize(rows: List[Dict]) -> Dict:
    ips = [row.get("ip") for row in rows if row.get("ip")]
    ip_counts = Counter(ips)

    total = len(rows)
    blocked = sum(1 for row in rows if row.get("rateLimited") is True)
    allowed = total - blocked
    unique_ips = len(ip_counts)
    max_requests_per_ip = max(ip_counts.values()) if ip_counts else 0
    avg_requests_per_ip = total / unique_ips if unique_ips else 0.0

    return {
        "total_requests": total,
        "allowed_requests": allowed,
        "blocked_requests": blocked,
        "unique_ips": unique_ips,
        "max_requests_per_ip": max_requests_per_ip,
        "avg_requests_per_ip": avg_requests_per_ip,
        "ip_counts": ip_counts,
    }


def pick_experiments() -> List[Dict]:
    experiments: List[Dict] = []

    for label, candidates in ATTACK_SPECS:
        path = newest_existing_file(candidates)
        if path is None:
            print(f"[WARN] No log file found for: {label}")
            continue

        rows = load_jsonl(path)
        summary = summarize(rows)
        summary["label"] = label
        summary["path"] = path
        experiments.append(summary)

    return experiments


def print_summary(experiments: List[Dict]) -> None:
    print("\n=== Scenario 4 Summary ===\n")
    header = (
        f"{'Attack Type':<24}"
        f"{'Total':>8}"
        f"{'Allowed':>10}"
        f"{'Blocked':>10}"
        f"{'Unique IPs':>12}"
        f"{'Max/IP':>10}"
        f"{'Avg/IP':>10}"
    )
    print(header)
    print("-" * len(header))

    for e in experiments:
        print(
            f"{e['label']:<24}"
            f"{e['total_requests']:>8}"
            f"{e['allowed_requests']:>10}"
            f"{e['blocked_requests']:>10}"
            f"{e['unique_ips']:>12}"
            f"{e['max_requests_per_ip']:>10}"
            f"{e['avg_requests_per_ip']:>10.2f}"
        )

    print()


def save_summary_csv(experiments: List[Dict]) -> Path:
    csv_path = OUT_DIR / "scenario4_summary.csv"
    fields = [
        "label",
        "path",
        "total_requests",
        "allowed_requests",
        "blocked_requests",
        "unique_ips",
        "max_requests_per_ip",
        "avg_requests_per_ip",
    ]

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for e in experiments:
            writer.writerow({k: e.get(k) for k in fields})

    return csv_path


def add_labels(ax, bars) -> None:
    for bar in bars:
        height = bar.get_height()
        ax.annotate(
            f"{int(height)}",
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=9,
        )


def plot_allowed_blocked(experiments: List[Dict]) -> Path:
    labels = [e["label"] for e in experiments]
    allowed = [e["allowed_requests"] for e in experiments]
    blocked = [e["blocked_requests"] for e in experiments]

    x = list(range(len(labels)))
    width = 0.36

    fig, ax = plt.subplots(figsize=(11, 6))
    bars1 = ax.bar([i - width / 2 for i in x], allowed, width, label="Allowed")
    bars2 = ax.bar([i + width / 2 for i in x], blocked, width, label="Blocked")

    ax.set_title("Scenario 4: Allowed vs Blocked Requests")
    ax.set_xlabel("Attack Type")
    ax.set_ylabel("Request Count")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15, ha="right")
    ax.legend()
    ax.grid(axis="y", alpha=0.25)

    add_labels(ax, bars1)
    add_labels(ax, bars2)

    fig.tight_layout()
    out = OUT_DIR / "scenario4_1_allowed_vs_blocked.png"
    fig.savefig(out, dpi=200, bbox_inches="tight")
    plt.close(fig)
    return out


def plot_identity_concentration(experiments: List[Dict]) -> Path:
    labels = [e["label"] for e in experiments]
    total = [e["total_requests"] for e in experiments]
    unique_ips = [e["unique_ips"] for e in experiments]
    max_per_ip = [e["max_requests_per_ip"] for e in experiments]

    x = list(range(len(labels)))
    width = 0.24

    fig, ax = plt.subplots(figsize=(11, 6))
    bars1 = ax.bar([i - width for i in x], total, width, label="Total Requests")
    bars2 = ax.bar(x, unique_ips, width, label="Unique IPs")
    bars3 = ax.bar([i + width for i in x], max_per_ip, width, label="Max Requests per IP")

    ax.set_title("Scenario 4: Identity Concentration")
    ax.set_xlabel("Attack Type")
    ax.set_ylabel("Count")
    ax.set_xticks(x)
    ax.set_xticklabels(labels, rotation=15, ha="right")
    ax.legend()
    ax.grid(axis="y", alpha=0.25)

    add_labels(ax, bars1)
    add_labels(ax, bars2)
    add_labels(ax, bars3)

    fig.tight_layout()
    out = OUT_DIR / "scenario4_2_identity_concentration.png"
    fig.savefig(out, dpi=200, bbox_inches="tight")
    plt.close(fig)
    return out


def main() -> None:
    experiments = pick_experiments()

    if not experiments:
        print("No matching scenario 4 logs were found in the logs/ folder.")
        return

    print_summary(experiments)

    csv_path = save_summary_csv(experiments)
    fig1 = plot_allowed_blocked(experiments)
    fig2 = plot_identity_concentration(experiments)

    print(f"Saved summary CSV: {csv_path}")
    print(f"Saved graph 1:     {fig1}")
    print(f"Saved graph 2:     {fig2}")
    print(f"\nAll outputs are in: {OUT_DIR}\n")


if __name__ == "__main__":
    main()