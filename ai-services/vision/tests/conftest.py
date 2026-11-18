import pytest

from app.services import classifier


@pytest.fixture(autouse=True)
def no_trained_model(monkeypatch, tmp_path):
    """Tests never depend on weights a developer happens to have in models/."""
    monkeypatch.setattr(classifier, "CLASSIFIER_PATH", tmp_path / "missing.onnx")
    monkeypatch.setattr(classifier, "CLASSIFIER_META_PATH", tmp_path / "missing.json")
    classifier.get_model.cache_clear()
    yield
    classifier.get_model.cache_clear()
