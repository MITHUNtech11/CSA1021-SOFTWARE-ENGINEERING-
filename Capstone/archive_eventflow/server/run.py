import os
import sys
from pathlib import Path
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    root_dir = Path(__file__).resolve().parent.parent
    if str(root_dir) not in sys.path:
        sys.path.insert(0, str(root_dir))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=True, app_dir=str(root_dir))
