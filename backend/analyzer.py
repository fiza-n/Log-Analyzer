

from collections import Counter, defaultdict
from typing import Optional

from .parser import LogEntry


def _percentile(sorted_values: list[float], p: float) -> float:
    
    if not sorted_values:
        return 0.0
    idx = (p / 100) * (len(sorted_values) - 1)
    lo, hi = int(idx), min(int(idx) + 1, len(sorted_values) - 1)
    return sorted_values[lo] + (sorted_values[hi] - sorted_values[lo]) * (idx - lo)


def status_code_distribution(entries: list[LogEntry]) -> dict:
  
    counts: dict[str, int] = {}
    groups: dict[str, int] = {"2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, "unknown": 0}

    for e in entries:
        if e.status is None:
            key = "unknown"
            groups["unknown"] += 1
        else:
            key = str(e.status)
            prefix = f"{e.status // 100}xx"
            groups[prefix] = groups.get(prefix, 0) + 1

        counts[key] = counts.get(key, 0) + 1

    sorted_counts = dict(
        sorted(counts.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 9999)
    )

    return {"by_code": sorted_counts, "by_group": groups}


def top_slow_endpoints(entries: list[LogEntry], n: int = 10) -> list[dict]:
  
    path_times: dict[str, list[float]] = defaultdict(list)

    for e in entries:
        path_times[e.path].append(e.response_ms)

    results = []
    for path, times in path_times.items():
        sorted_times = sorted(times)
        results.append({
            "path":        path,
            "avg_ms":      round(sum(times) / len(times), 1),
            "p95_ms":      round(_percentile(sorted_times, 95), 1),
            "max_ms":      round(max(times), 1),
            "count":       len(times),
        })

    return sorted(results, key=lambda x: x["avg_ms"], reverse=True)[:n]


def top_ips(entries: list[LogEntry], n: int = 10) -> list[dict]:
   
    ip_total:  Counter = Counter()
    ip_errors: Counter = Counter()

    for e in entries:
        ip_total[e.ip] += 1
        if e.status and e.status >= 400:
            ip_errors[e.ip] += 1

    return [
        {
            "ip":          ip,
            "requests":    count,
            "errors":      ip_errors[ip],
            "error_rate":  round(ip_errors[ip] / count * 100, 1),
        }
        for ip, count in ip_total.most_common(n)
    ]


def error_rate_by_path(entries: list[LogEntry]) -> list[dict]:
   
    path_total:  Counter = Counter()
    path_errors: Counter = Counter()

    for e in entries:
        path_total[e.path] += 1
        if e.status and e.status >= 400:
            path_errors[e.path] += 1

    results = []
    for path, errors in path_errors.most_common():
        total = path_total[path]
        results.append({
            "path":       path,
            "errors":     errors,
            "total":      total,
            "error_rate": round(errors / total * 100, 1),
        })

    return results


def requests_over_time(entries: list[LogEntry], bucket_minutes: int = 5) -> list[dict]:
   
    buckets: dict[str, dict] = defaultdict(lambda: {"total": 0, "errors": 0})
    bucket_secs = bucket_minutes * 60

    for e in entries:
        ts = e.timestamp.timestamp()
        bucket_ts = int(ts // bucket_secs) * bucket_secs
        key = str(bucket_ts)
        buckets[key]["total"] += 1
        if e.status and e.status >= 400:
            buckets[key]["errors"] += 1

    return [
        {
            "time":   int(k),
            "total":  v["total"],
            "errors": v["errors"],
        }
        for k, v in sorted(buckets.items(), key=lambda x: int(x[0]))
    ]


def method_distribution(entries: list[LogEntry]) -> dict[str, int]:
    counts: Counter = Counter(e.method for e in entries)
    return dict(counts.most_common())


def overall_summary(
    entries: list[LogEntry],
    skipped: list[dict],
    total_lines: int,
    format_counts: dict[str, int],
) -> dict:
    if not entries:
        return {
            "total_lines": total_lines,
            "parsed":      0,
            "skipped":     len(skipped),
            "error_rate":  0,
            "avg_ms":      0,
            "p95_ms":      0,
        }

    all_times = sorted(e.response_ms for e in entries)
    error_count = sum(1 for e in entries if e.status and e.status >= 400)

    # Count skip reasons
    skip_reasons: Counter = Counter(s["reason"] for s in skipped)

    return {
        "total_lines":   total_lines,
        "parsed":        len(entries),
        "skipped":       len(skipped),
        "skip_reasons":  dict(skip_reasons),
        "format_counts": format_counts,
        "error_count":   error_count,
        "error_rate":    round(error_count / len(entries) * 100, 1),
        "avg_ms":        round(sum(all_times) / len(all_times), 1),
        "p95_ms":        round(_percentile(all_times, 95), 1),
        "max_ms":        round(max(all_times), 1),
        "total_requests": len(entries),
    }


def full_analysis(
    entries:       list[LogEntry],
    skipped:       list[dict],
    total_lines:   int,
    format_counts: dict[str, int],
    top_n:         int = 10,
) -> dict:
  
    return {
        "summary":              overall_summary(entries, skipped, total_lines, format_counts),
        "status_distribution":  status_code_distribution(entries),
        "slow_endpoints":       top_slow_endpoints(entries, top_n),
        "top_ips":              top_ips(entries, top_n),
        "error_by_path":        error_rate_by_path(entries),
        "requests_over_time":   requests_over_time(entries),
        "method_distribution":  method_distribution(entries),
        "skipped_lines":        skipped[:200],    # cap at 200 for API response size
    }