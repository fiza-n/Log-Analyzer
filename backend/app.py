import os
import tempfile

from flask import Flask, jsonify, request
from flask_cors import CORS

from .analyzer import full_analysis
from .parser import parse_file

app = Flask(__name__)
CORS(app)   

MAX_FILE_SIZE = 200 * 1024 * 1024   


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/analyze")
def analyze():
  
    if "logfile" not in request.files:
        return jsonify({"error": "No file uploaded. Send a multipart form with field 'logfile'."}), 400

    file = request.files["logfile"]

    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

   
    suffix = os.path.splitext(file.filename or ".log")[1] or ".log"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        chunk_size = 8192
        total_bytes = 0
        while True:
            chunk = file.stream.read(chunk_size)
            if not chunk:
                break
            total_bytes += len(chunk)
            if total_bytes > MAX_FILE_SIZE:
                os.unlink(tmp_path)
                return jsonify({"error": f"File too large. Max size is {MAX_FILE_SIZE // (1024*1024)} MB."}), 413
            tmp.write(chunk)

    try:
        result   = parse_file(tmp_path)
        analysis = full_analysis(
            entries       = result.entries,
            skipped       = result.skipped_lines,
            total_lines   = result.total_lines,
            format_counts = result.format_counts,
        )
        analysis["filename"] = file.filename
        return jsonify(analysis)
    except Exception as exc:
        
        return jsonify({"error": f"Parse failed: {str(exc)}"}), 500
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)