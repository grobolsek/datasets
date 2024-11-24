import os
from functools import cache

@cache
def get_environment():
    for where in ("production", "local"):
        fname = f"../frontend/.env.{where}"
        if os.path.exists(fname):
            with open(fname) as f:
                return dict(row.split("=") for row in f)
    raise FileNotFoundError("No environment file found")

def get_url(location, domain):
    base = get_environment()["REACT_APP_FILES_URL_BASE"]
    if domain:
        return os.path.join(base, domain, location)
    else:
        return os.path.join(base, location)