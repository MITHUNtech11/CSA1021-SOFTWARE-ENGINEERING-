import os
import pytest
from server.database import get_db, init_schema, seed_if_empty


@pytest.fixture(scope="session", autouse=True)
def init_test_env(tmp_path_factory):
    test_db = str(tmp_path_factory.mktemp("data") / "test_eventflow.db")
    old_db = os.environ.get("DB_PATH")
    os.environ["DB_PATH"] = test_db

    # Initialize schema and seed data
    with get_db(test_db) as conn:
        init_schema(conn)
        seed_if_empty(conn)

    yield test_db

    # Teardown
    if old_db is not None:
        os.environ["DB_PATH"] = old_db
    else:
        os.environ.pop("DB_PATH", None)

    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except OSError:
            pass
