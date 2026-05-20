

import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from dateutil import parser as dateutil_parser



@dataclass
class LogEntry:
    timestamp:     datetime
    ip:            str
    method:        str
    path:          str
    status:        Optional[int]      
    response_ms:   float
    extra_fields:  list[str] = field(default_factory=list)
    source_format: str = "standard"  
    raw_line:      str = ""


@dataclass
class ParseResult:
    entries:          list[LogEntry]
    skipped_lines:    list[dict]      
    total_lines:      int
    format_counts:    dict[str, int]   




_TS_ISO       = r'(?P<ts_iso>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?)'
_TS_SLASH     = r'(?P<ts_slash>\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2})'
_TS_HUMAN     = r'(?P<ts_human>\d{1,2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2}:\d{2})'
_TS_EPOCH     = r'(?P<ts_epoch>\d{10})'         

_TS_PATTERN   = f'({_TS_ISO}|{_TS_SLASH}|{_TS_HUMAN}|{_TS_EPOCH})'

_CORE = (
    r'\s+(?P<ip>\d{1,3}(?:\.\d{1,3}){3})'      
    r'\s+(?P<method>GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)'
    r'\s+(?P<path>\S+)'                           
    r'\s+(?P<status>\d{3}|-)'                    
    r'\s+(?P<resp_time>\d+(?:\.\d+)?(?:ms|s)?)'
    r'(?P<extra>.*)?$'                            
)

LINE_RE = re.compile(_TS_PATTERN + _CORE, re.IGNORECASE)

RESP_RE = re.compile(r'^(?P<val>\d+(?:\.\d+)?)(?P<unit>ms|s)?$', re.IGNORECASE)



def _parse_timestamp(match: re.Match) -> tuple[datetime, str]:
   
    if match.group("ts_epoch"):
        raw = match.group("ts_epoch")
        dt  = datetime.fromtimestamp(int(raw), tz=timezone.utc)
        return dt, "epoch"

    if match.group("ts_iso"):
        raw = match.group("ts_iso")
        dt  = dateutil_parser.parse(raw).replace(tzinfo=timezone.utc)
        return dt, "iso8601"

    if match.group("ts_slash"):
        raw = match.group("ts_slash")
        dt  = dateutil_parser.parse(raw).replace(tzinfo=timezone.utc)
        return dt, "slash"

    if match.group("ts_human"):
        raw = match.group("ts_human")
        dt  = dateutil_parser.parse(raw).replace(tzinfo=timezone.utc)
        return dt, "human"

    raise ValueError("No timestamp group matched — should not reach here")



def _parse_response_ms(raw: str) -> float:
   
    m = RESP_RE.match(raw.strip())
    if not m:
        raise ValueError(f"Cannot parse response time: {raw!r}")

    val  = float(m.group("val"))
    unit = (m.group("unit") or "ms").lower()  

    if unit == "s":
        return val * 1000.0    
    return val                



def _try_parse_json_line(line: str) -> Optional[LogEntry]:

    try:
        obj = json.loads(line.strip())
    except (json.JSONDecodeError, ValueError):
        return None

    if not all(k in obj for k in ("timestamp", "method", "path")):
        return None

    try:
        dt     = dateutil_parser.parse(str(obj["timestamp"])).replace(tzinfo=timezone.utc)
        method = str(obj.get("method", "GET")).upper()
        path   = str(obj.get("path", "/"))
        ip     = str(obj.get("ip", "0.0.0.0"))

        raw_status = obj.get("status")
        status = int(raw_status) if raw_status and str(raw_status) != "-" else None

        raw_rt = str(obj.get("duration", obj.get("response_time", "0ms")))
        resp_ms = _parse_response_ms(raw_rt)

        return LogEntry(
            timestamp=dt,
            ip=ip,
            method=method,
            path=path,
            status=status,
            response_ms=resp_ms,
            source_format="json",
            raw_line=line,
        )
    except Exception:
        return None



def _parse_line(line: str) -> Optional[LogEntry]:
  
    stripped = line.strip()

    if not stripped:
        return None   # blank line

    if stripped.startswith("{"):
        return _try_parse_json_line(stripped)

    m = LINE_RE.match(stripped)
    if not m:
        return None   # genuinely unparseable

    try:
        dt, fmt     = _parse_timestamp(m)
        status_raw  = m.group("status")
        status      = int(status_raw) if status_raw != "-" else None
        resp_ms     = _parse_response_ms(m.group("resp_time"))
        extra_raw   = (m.group("extra") or "").strip()
        extra_fields = [e.strip() for e in extra_raw.split() if e.strip()] if extra_raw else []

        return LogEntry(
            timestamp=dt,
            ip=m.group("ip"),
            method=m.group("method").upper(),
            path=m.group("path"),
            status=status,
            response_ms=resp_ms,
            extra_fields=extra_fields,
            source_format=fmt,
            raw_line=line,
        )
    except (ValueError, KeyError):
        return None



def parse_file(filepath: str) -> ParseResult:
   
    entries:       list[LogEntry]   = []
    skipped_lines: list[dict]       = []
    format_counts: dict[str, int]   = {}

    STACK_TRACE_RE = re.compile(
        r'^(Traceback \(most recent|  File "|    |Error:|Exception:|\w+Error:|\w+Exception:)',
        re.IGNORECASE
    )

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line_no, raw_line in enumerate(f, start=1):
            line = raw_line.rstrip("\n")

            if not line.strip():
                skipped_lines.append({
                    "line_no": line_no,
                    "reason":  "blank",
                    "raw":     repr(line),
                })
                continue

            if STACK_TRACE_RE.match(line.strip()):
                skipped_lines.append({
                    "line_no": line_no,
                    "reason":  "stack_trace",
                    "raw":     line[:120],
                })
                continue

            entry = _parse_line(line)

            if entry is None:
                skipped_lines.append({
                    "line_no": line_no,
                    "reason":  "unparseable",
                    "raw":     line[:120],
                })
                continue

            entries.append(entry)
            format_counts[entry.source_format] = format_counts.get(entry.source_format, 0) + 1

    return ParseResult(
        entries=entries,
        skipped_lines=skipped_lines,
        total_lines=line_no,       # type: ignore[possibly-undefined]
        format_counts=format_counts,
    )