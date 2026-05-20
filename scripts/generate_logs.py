"""
generate_logs.py — Generates a realistic server log file for testing.

Usage:
    python scripts/generate_logs.py                        # default 5000 lines → logs/test.log
    python scripts/generate_logs.py --lines 50000          # larger file
    python scripts/generate_logs.py --output logs/big.log  # custom output path
    python scripts/generate_logs.py --lines 1000 --seed 42 # reproducible output
"""

import argparse
import json
import os
import random
import time
from datetime import datetime, timedelta, timezone


# ── Seed data ──────────────────────────────────────────────────────────────────

PATHS = [
    "/api/users", "/api/users/12", "/api/users/99", "/api/users/404",
    "/api/login", "/api/logout", "/api/products", "/api/products/7",
    "/api/orders", "/api/orders/55", "/api/search", "/api/health",
    "/api/metrics", "/api/admin/config", "/static/main.js", "/static/style.css",
    "/favicon.ico", "/", "/404", "/api/payments", "/api/payments/refund",
]

METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
METHOD_WEIGHTS = [50, 20, 10, 10, 10]          # GET is most common

STATUS_CODES = [200, 200, 200, 201, 204, 301, 400, 401, 403, 404, 429, 500, 502, 503]
STATUS_WEIGHTS = [40, 5, 5, 3, 2, 3, 5, 5, 3, 10, 2, 8, 4, 5]

IPS = [
    "192.168.1.42", "10.0.0.7", "172.16.0.5", "203.0.113.10",
    "198.51.100.22", "192.0.2.15", "10.10.10.1", "185.220.101.3",
    "45.142.212.100", "91.108.4.0",
]

USER_AGENTS = [
    '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"',
    '"curl/7.68.0"',
    '"python-requests/2.28.0"',
    '"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)"',
    '"Go-http-client/1.1"',
]

REFERRERS = ['"https://example.com"', '"https://google.com"', '"-"', '"https://internal.app"']

STACK_TRACE_LINES = [
    "Traceback (most recent call last):",
    '  File "/app/api/users.py", line 42, in get_user',
    "    result = db.query(user_id)",
    "sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) SSL connection lost",
]


# ── Timestamp formatters ────────────────────────────────────────────────────────

def fmt_iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def fmt_slash(dt: datetime) -> str:
    return dt.strftime("%Y/%m/%d %H:%M:%S")

def fmt_human(dt: datetime) -> str:
    return dt.strftime("%d-%b-%Y %H:%M:%S")

def fmt_epoch(dt: datetime) -> str:
    return str(int(dt.replace(tzinfo=timezone.utc).timestamp()))

TIMESTAMP_FORMATS = [fmt_iso, fmt_iso, fmt_iso, fmt_slash, fmt_human, fmt_epoch]
# fmt_iso appears 3× so it's the majority (~50%)


# ── Response time formatters ────────────────────────────────────────────────────

def fmt_ms(ms: int) -> str:
    return f"{ms}ms"

def fmt_s(ms: int) -> str:
    return f"{ms / 1000:.3f}s"

def fmt_bare(ms: int) -> str:
    return str(ms)

RESPONSE_TIME_FORMATS = [fmt_ms, fmt_ms, fmt_ms, fmt_s, fmt_bare]
# fmt_ms appears 3× so it's the majority


# ── Line builders ───────────────────────────────────────────────────────────────

def normal_line(dt: datetime, rng: random.Random) -> str:
    ts      = rng.choice(TIMESTAMP_FORMATS)(dt)
    ip      = rng.choice(IPS)
    method  = rng.choices(METHODS, weights=METHOD_WEIGHTS)[0]
    path    = rng.choice(PATHS)
    status  = rng.choices(STATUS_CODES, weights=STATUS_WEIGHTS)[0]
    resp_ms = int(rng.lognormvariate(4, 1))          # realistic skewed distribution
    resp_ms = max(1, min(resp_ms, 30_000))
    rt      = rng.choice(RESPONSE_TIME_FORMATS)(resp_ms)

    line = f"{ts} {ip} {method} {path} {status} {rt}"

    # ~15% of normal lines get extra fields appended
    if rng.random() < 0.15:
        line += f" {rng.choice(USER_AGENTS)}"
    if rng.random() < 0.08:
        line += f" {rng.choice(REFERRERS)}"

    return line


def missing_status_line(dt: datetime, rng: random.Random) -> str:
    ts      = fmt_iso(dt)
    ip      = rng.choice(IPS)
    method  = rng.choices(METHODS, weights=METHOD_WEIGHTS)[0]
    path    = rng.choice(PATHS)
    resp_ms = rng.randint(50, 5000)
    rt      = fmt_ms(resp_ms)
    return f"{ts} {ip} {method} {path} - {rt}"


def json_line(dt: datetime, rng: random.Random) -> str:
    level = rng.choice(["info", "warn", "error"])
    return json.dumps({
        "timestamp": fmt_iso(dt),
        "level":     level,
        "method":    rng.choices(METHODS, weights=METHOD_WEIGHTS)[0],
        "path":      rng.choice(PATHS),
        "status":    rng.choices(STATUS_CODES, weights=STATUS_WEIGHTS)[0],
        "duration":  f"{rng.randint(10, 3000)}ms",
        "ip":        rng.choice(IPS),
    })


def partial_line(rng: random.Random) -> str:
    """Simulates a partial/truncated write."""
    fragments = [
        "2024-03-15T14:23",
        "192.168.1.1 GET",
        "POST /api/login 40",
        "   ",
        "GET /api",
        "",
    ]
    return rng.choice(fragments)


def stack_trace_block() -> list[str]:
    return STACK_TRACE_LINES[:]


def leading_whitespace_line(dt: datetime, rng: random.Random) -> str:
    """Normal line but with leading spaces — format variant."""
    return "  " + normal_line(dt, rng)


# ── Main generator ──────────────────────────────────────────────────────────────

def generate(n_lines: int, output_path: str, seed: int | None) -> None:
    rng = random.Random(seed)

    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    # Start timestamp: a week ago, advance roughly 1 request per second on average
    start = datetime(2024, 3, 15, 0, 0, 0)
    current = start

    lines_written = 0
    anomaly_counts = {
        "missing_status": 0,
        "json":           0,
        "partial":        0,
        "stack_trace":    0,
        "blank":          0,
        "whitespace":     0,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        while lines_written < n_lines:
            # Advance time: between 0 ms and 2 s between requests
            current += timedelta(milliseconds=rng.randint(0, 2000))

            roll = rng.random()

            if roll < 0.01:                        # 1%  — blank line
                f.write("\n")
                anomaly_counts["blank"] += 1
                lines_written += 1

            elif roll < 0.02:                      # 1%  — partial/malformed
                f.write(partial_line(rng) + "\n")
                anomaly_counts["partial"] += 1
                lines_written += 1

            elif roll < 0.03:                      # 1%  — stack trace (3–4 lines)
                for trace_line in stack_trace_block():
                    f.write(trace_line + "\n")
                    lines_written += 1
                    if lines_written >= n_lines:
                        break
                anomaly_counts["stack_trace"] += 1

            elif roll < 0.06:                      # 3%  — JSON-format line
                f.write(json_line(current, rng) + "\n")
                anomaly_counts["json"] += 1
                lines_written += 1

            elif roll < 0.09:                      # 3%  — missing status
                f.write(missing_status_line(current, rng) + "\n")
                anomaly_counts["missing_status"] += 1
                lines_written += 1

            elif roll < 0.11:                      # 2%  — leading whitespace
                f.write(leading_whitespace_line(current, rng) + "\n")
                anomaly_counts["whitespace"] += 1
                lines_written += 1

            else:                                  # ~89% — normal lines
                f.write(normal_line(current, rng) + "\n")
                lines_written += 1

    # Summary
    total_anomalies = sum(anomaly_counts.values())
    pct = total_anomalies / lines_written * 100
    print(f"✅  Generated {lines_written:,} lines → {output_path}")
    print(f"    Normal lines   : {lines_written - total_anomalies:,}")
    print(f"    Anomalous lines: {total_anomalies:,}  ({pct:.1f}%)")
    for kind, count in anomaly_counts.items():
        print(f"      {kind:<20}: {count:,}")


# ── CLI ─────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate test server log files.")
    parser.add_argument("--lines",  type=int,   default=5_000,          help="Number of log lines (default: 5000)")
    parser.add_argument("--output", type=str,   default="logs/test.log", help="Output file path (default: logs/test.log)")
    parser.add_argument("--seed",   type=int,   default=None,           help="Random seed for reproducible output")
    args = parser.parse_args()

    generate(args.lines, args.output, args.seed)