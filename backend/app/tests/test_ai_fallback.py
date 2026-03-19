from app.services.ai_service import fallback_parse


def test_fallback_parse_structured():
    """Happy path: fallback parser extracts structured data from natural language."""
    result = fallback_parse("5 bags of arabica coffee expires june 15")
    assert result.method == "fallback"
    assert result.quantity == 5.0
    assert result.category == "Coffee"
    assert result.expiry_date is not None
    assert result.name is not None


def test_fallback_parse_garbled():
    """Edge case: fallback parser handles garbled input without crashing."""
    result = fallback_parse("asdf!@#$% gibberish 123xyz")
    assert result.method == "fallback"
    # Should not crash, fields may be None
    assert isinstance(result.name, (str, type(None)))
