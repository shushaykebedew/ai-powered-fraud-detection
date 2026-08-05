import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
client.__enter__()  # trigger lifespan startup (creates tables, loads model) once for the module


def _register_and_login():
    email = "test.analyst@example.com"
    password = "SuperSecret123"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Test Analyst", "password": password},
    )
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password},
    )
    return resp.json()["access_token"]


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_register_and_login():
    token = _register_and_login()
    assert token

    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "test.analyst@example.com"


def test_predict_requires_auth():
    resp = client.post("/api/v1/predictions/predict", json={})
    assert resp.status_code == 401


def test_predict_and_history():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    transaction = {
        "step": 12,
        "type": "TRANSFER",
        "amount": 181000.00,
        "name_orig": "C1231006815",
        "oldbalance_org": 181000.00,
        "newbalance_orig": 0.00,
        "name_dest": "C1666544295",
        "oldbalance_dest": 0.00,
        "newbalance_dest": 0.00,
    }
    resp = client.post("/api/v1/predictions/predict", json=transaction, headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert 0.0 <= body["risk_score"] <= 1.0
    assert body["risk_level"] in ("low", "medium", "high")
    assert len(body["top_factors"]) > 0

    hist = client.get("/api/v1/predictions/history", headers=headers)
    assert hist.status_code == 200
    assert hist.json()["total"] >= 1


def test_refresh_token_flow():
    email = "refresh.user@example.com"
    password = "SuperSecret123"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Refresh User", "password": password},
    )
    login_resp = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    tokens = login_resp.json()
    assert tokens["refresh_token"]

    refresh_resp = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert new_tokens["access_token"]

    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["email"] == email

    # an access token must not work as a refresh token
    bad_refresh = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": tokens["access_token"]}
    )
    assert bad_refresh.status_code == 401


def test_first_user_is_admin_and_admin_endpoints_enforced():
    # the very first user registered in the whole suite (test.analyst@example.com,
    # from test_register_and_login, which pytest runs first in this file) is admin.
    admin_token = _register_and_login()
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    admin_check = client.get("/api/v1/auth/me", headers=admin_headers)
    assert admin_check.json()["role"] == "admin"

    users_resp = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 1

    stats_resp = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert stats_resp.status_code == 200
    assert "total_users" in stats_resp.json()

    # a second (non-first) user should NOT have admin access
    email = "not.admin@example.com"
    password = "SuperSecret123"
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Not Admin", "password": password},
    )
    login_resp = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    non_admin_token = login_resp.json()["access_token"]
    non_admin_headers = {"Authorization": f"Bearer {non_admin_token}"}

    forbidden = client.get("/api/v1/admin/users", headers=non_admin_headers)
    assert forbidden.status_code == 403


def test_batch_predict():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    csv_content = (
        "step,type,amount,name_orig,oldbalance_org,newbalance_orig,name_dest,oldbalance_dest,newbalance_dest\n"
        "12,TRANSFER,181000.00,C1231006815,181000.00,0.00,C1666544295,0.00,0.00\n"
        "45,PAYMENT,4820.50,C900129384,25400.00,20579.50,M100004892,0.00,0.00\n"
        "1,TRANSFER,-5,C1,10,10,C2,0,0\n"  # invalid: negative amount
    )
    files = {"file": ("transactions.csv", csv_content, "text/csv")}
    resp = client.post("/api/v1/predictions/batch", headers=headers, files=files)

    assert resp.status_code == 200
    body = resp.json()
    assert body["total_rows"] == 3
    assert body["scored"] == 2
    assert body["failed"] == 1
    assert len(body["results"]) == 3
    assert body["results"][2]["status"] == "error"
