import subprocess
import sys
import os
import time
import webbrowser
import signal

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

def main():
    print("=" * 65)
    print("STARTING SMART CAMPUS FACILITY & OPERATIONS PLATFORM")
    print("=" * 65)
    
    # 1. Start FastAPI Backend on port 8000
    print("[1/3] Launching FastAPI Backend on http://127.0.0.1:8000...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--log-level", "info"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=BACKEND_DIR)
    
    # 2. Start Frontend HTTP server on port 3000
    print("[2/3] Serving Web Frontend on http://127.0.0.1:3000...")
    frontend_cmd = [sys.executable, "-m", "http.server", "3000", "--bind", "127.0.0.1"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=FRONTEND_DIR)

    time.sleep(2)

    # 3. Open Web Browser
    url = "http://127.0.0.1:3000"
    print(f"[3/3] Opening user browser at: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Notice: Could not automatically open browser ({e}). Access manually at {url}")

    print("\nPlatform is actively running!")
    print("  - Web Frontend: http://127.0.0.1:3000")
    print("  - Backend API:  http://127.0.0.1:8000")
    print("  - Swagger Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        while True:
            time.sleep(1)
            # Check if any sub-process died unexpectedly
            if backend_proc.poll() is not None:
                print("Backend terminated.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend terminated.")
                break
    except KeyboardInterrupt:
        print("\nShutting down platform...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Platform stopped cleanly.")

if __name__ == "__main__":
    main()
