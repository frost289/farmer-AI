"""Classifier tests: the stub fallback and the real ONNX path (synthetic tiny model)."""

import json

import numpy as np
import pytest

from app.services import classifier, preprocess
from tests.helpers import png_bytes, textured

GREEN = (60, 140, 50)
YELLOW = (210, 190, 40)
LABELS = ["maize_streak_virus", "maize_gray_leaf_spot", "healthy"]


def test_stub_is_deterministic_sorted_and_never_confident():
    for seed in range(20):
        data = png_bytes(textured(GREEN, seed=seed))
        a, b = classifier.classify(data, "maize"), classifier.classify(data, "maize")
        assert a == b
        confidences = [p["confidence"] for p in a]
        assert confidences == sorted(confidences, reverse=True)
        assert (
            confidences[0] < 0.5
        )  # the api must flag every stub answer as low_confidence
        known = {i["label"] for i in classifier.load_taxonomy()}
        assert all(p["label"] in known for p in a)
    assert classifier.backend() == "stub"
    assert classifier.model_version().endswith("-stub")


@pytest.fixture
def onnx_model(monkeypatch, tmp_path):
    """Tiny real ONNX model: mean colour per channel -> 3 logits (yellow, other, green)."""
    onnx = pytest.importorskip("onnx")
    from onnx import TensorProto, helper, numpy_helper

    def build(labels=LABELS, temperature=1.0):
        weights = np.array(
            [[3, 0, -3], [-3, 0, 3], [0, 0, 0]], dtype=np.float32
        )  # rows: R, G, B
        graph = helper.make_graph(
            [
                helper.make_node(
                    "ReduceMean", ["input"], ["pooled"], axes=[2, 3], keepdims=0
                ),
                helper.make_node("MatMul", ["pooled", "w"], ["logits"]),
            ],
            "tiny",
            [
                helper.make_tensor_value_info(
                    "input", TensorProto.FLOAT, ["batch", 3, 224, 224]
                )
            ],
            [helper.make_tensor_value_info("logits", TensorProto.FLOAT, ["batch", 3])],
            [numpy_helper.from_array(weights, "w")],
        )
        model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)])
        model.ir_version = 8
        onnx.save(model, tmp_path / "classifier.onnx")
        meta = {
            "version": "v-test",
            "labels": labels,
            "input_size": 224,
            "temperature": temperature,
        }
        (tmp_path / "labels.json").write_text(json.dumps(meta))
        monkeypatch.setattr(classifier, "CLASSIFIER_PATH", tmp_path / "classifier.onnx")
        monkeypatch.setattr(
            classifier, "CLASSIFIER_META_PATH", tmp_path / "labels.json"
        )
        classifier.get_model.cache_clear()

    return build


def predict(rgb, crop=None):
    data = png_bytes(textured(rgb))
    return classifier.classify(data, crop, preprocess.load_image(data))


def test_onnx_model_is_used_and_reads_the_image(onnx_model):
    onnx_model()
    assert classifier.backend() == "onnx" and classifier.model_version() == "v-test"
    assert predict(GREEN)[0]["label"] == "healthy"
    assert predict(GREEN)[0]["type"] == "healthy"
    assert predict(YELLOW)[0]["label"] == "maize_streak_virus"
    assert predict(YELLOW)[0]["type"] == "disease"


def test_onnx_output_follows_the_contract(onnx_model):
    onnx_model()
    result = predict(YELLOW)
    assert 1 <= len(result) <= 3
    assert [p["confidence"] for p in result] == sorted(
        (p["confidence"] for p in result), reverse=True
    )
    assert sum(p["confidence"] for p in result) <= 1.0001


def test_crop_the_model_was_not_trained_on_is_never_confident(onnx_model):
    onnx_model()  # knows maize diseases and "healthy", but no cassava disease
    result = predict(GREEN, crop="cassava")
    assert result[0]["confidence"] <= 0.49  # the api must flag it low_confidence
    assert len(result) > 1  # not collapsed to a lone "healthy" answer


def test_crop_masking_keeps_the_crops_own_labels(onnx_model):
    onnx_model()
    labels = {p["label"] for p in predict(YELLOW, crop="maize")}
    assert labels <= set(LABELS)
    assert "maize_streak_virus" in labels


def test_temperature_lowers_confidence(onnx_model):
    onnx_model(temperature=1.0)
    sharp = predict(YELLOW)[0]["confidence"]
    onnx_model(temperature=20.0)
    assert predict(YELLOW)[0]["confidence"] < sharp


def test_labels_outside_the_taxonomy_fall_back_to_the_stub(onnx_model):
    onnx_model(labels=["maize_streak_virus", "not_a_real_label", "healthy"])
    assert classifier.backend() == "stub"
