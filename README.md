# Log Analyzer

A full-stack log analysis tool that parses server logs with mixed formats and malformed entries, producing real-time insights through an interactive web dashboard.

## Quick Start

### Prerequisites
- Python 3.9+ with pip
- Node.js 18+ with npm
- A web browser

### Run on a Fresh Machine

```bash
# Clone/navigate to the repo
cd Log-Analyzer

# Install and run backend (in one terminal)
cd backend
pip install flask flask-cors python-dateutil
python -m app

# Install and run frontend (in another terminal)
cd log-Analyzer
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will connect to the backend API at `http://localhost:5000`.

## How to Use

1. **Start the services** (see Quick Start above)
2. **Upload a log file** via the web interface, or use the API directly:
   ```bash
   curl -X POST -F "logfile=@your_log_file.log" http://localhost:5000/api/analyze
   ```
3. **View analytics** in the dashboard:
   - **Overview**: Summary stats, request timeline, status distribution
   - **Performance**: Slow endpoints ranked by average response time
   - **Traffic**: Top requesting IPs with error rates
   - **Errors & Status**: Status code breakdown and error endpoints

## Generate Test Data

The project includes a log generator to create representative test files:

```bash
cd scripts
python generate_logs.py
```

This creates a `sample_logs.log` file with ~1000 entries covering:
- Standard Apache-like format entries
- Alternative timestamp formats (ISO, Unix epoch, custom)
- Varying response time units (ms, seconds, raw)
- Missing or malformed fields
- Mixed JSON-formatted log lines
- Blank lines and truncated entries

## Architecture

**Backend (Python/Flask)**
- `analyzer.py`: Core log analysis functions (parsing, aggregation, statistics)
- `parser.py`: Robust multi-format log parser handling ~6 format variants
- `app.py`: REST API endpoint for file upload and analysis

**Frontend (React/Vite)**
- `src/App.jsx`: Main entry point and file upload handler
- `src/components/Dashboard.jsx`: Multi-tab analytics interface
- `src/components/Timeline.jsx`: Request volume and error trends over time
- `src/components/SlowEndpoints.jsx`: Performance analysis by endpoint
- `src/components/TopIPs.jsx`: Traffic and error rate by IP address
- `src/components/StatusPanel.jsx`: HTTP status code distribution chart
- `src/components/StatCards.jsx`: Key metrics cards
- `src/components/UploadZone.jsx`: Drag-and-drop file upload
- `src/components/ParseQuality.jsx`: Parse result summary

## Error Handling

The tool gracefully handles:
- **Malformed lines**: Silently skips with count reporting
- **Format diversity**: Auto-detects and normalizes timestamps, response times, status codes
- **Missing fields**: Treats as `-` or empty; aggregations skip null values
- **Large files**: Streams processing to avoid memory issues
- **Partial writes**: Handles incomplete log entries

## Project Structure

```
Log-Analyzer/
├── backend/                 # Flask API
│   ├── __init__.py
│   ├── app.py              # API endpoints
│   ├── analyzer.py         # Analysis functions
│   └── parser.py           # Multi-format log parser
├── log-Analyzer/           # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── scripts/
    └── generate_logs.py    # Test data generator
```

## Stack Notes
