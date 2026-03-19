def test_create_and_get_item(client):
    """Happy path: create item via POST, retrieve via GET, verify fields."""
    payload = {
        "name": "Organic Milk",
        "quantity": 10,
        "unit": "liters",
        "cost_per_unit": 125.00,
        "expiry_date": "2026-12-31",
        "notes": "From local farm",
    }
    resp = client.post("/api/inventory", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Organic Milk"
    assert data["quantity"] == 10
    assert data["unit"] == "liters"
    assert data["status"] == "active"
    item_id = data["id"]

    resp2 = client.get(f"/api/inventory/{item_id}")
    assert resp2.status_code == 200
    assert resp2.json()["name"] == "Organic Milk"


def test_create_item_missing_fields(client):
    """Edge case: POST with missing required fields returns 422."""
    resp = client.post("/api/inventory", json={"unit": "kg"})
    assert resp.status_code == 422
