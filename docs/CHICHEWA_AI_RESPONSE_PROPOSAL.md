# Chichewa AI Response Contract Proposal

**Status: Team agreement reported; implementation in progress.**

The team has agreed to the response-language and fallback approach. The additive metadata changes are being implemented on the feature branch. Chichewa taxonomy values and safety-critical translations remain subject to fluent-speaker review.

## Goal

When a farmer selects Chichewa (`ny`), all human-readable AI-generated explanations should be in Chichewa where reviewed translations or a suitable language model are available. The app must not silently present English text as if it were Chichewa.

## Keep machine identifiers stable

Do not translate values used by code, storage, routing, or model evaluation:

- Diagnosis labels such as `maize_streak_virus` and `fall_armyworm`
- Enum values such as `plant`, `wait`, `not_recommended`, `low`, and `high`
- Crop identifiers such as `maize` and `cassava`

Translate only display text. Disease and pest display names belong in `docs/label-taxonomy.json`, with the `ny` value filled only after review by a fluent Chichewa speaker with relevant agricultural knowledge.

## Proposed language behaviour

Use the existing `language` enum (`en` or `ny`) consistently on every AI request that generates human-readable text.

| AI operation | Existing language field | Proposed behaviour |
|---|---|---|
| Advisory question | Yes | Return the answer in the requested language. |
| Treatment | Yes | Return each treatment, prevention item, and warning in the requested language. |
| Planting readiness | Not currently shown in the documented request | Add requested language; return the `reason` in that language. |
| Crop recommendations | Not currently shown in the documented request | Add requested language; return each `reason` in that language. |
| Vision diagnosis | No user-facing prose expected | Keep stable label identifiers; resolve display names through the shared taxonomy. |

## Proposed response metadata

For discussion, consider adding the following fields to AI-generated text responses:

- `language`: language actually used, `en` or `ny`.
- `language_fallback`: boolean indicating that the service had to return English because it could not safely produce reviewed Chichewa content.

The agreed metadata is additive. The web app shows a clear fallback notice when `language_fallback` is true, rather than assuming the requested language was delivered.

## Safety and quality rules

1. Never invent Chichewa disease names, pesticide names, application rates, withholding periods, or treatment instructions.
2. Do not translate chemical/common product names in a way that makes the product ambiguous.
3. Keep treatment advice grounded in reviewed Malawi-specific sources. Language translation must not change dosage, timing, safety warnings, or meaning.
4. If a reliable Chichewa response is unavailable, return English with explicit fallback metadata.
5. A fluent Chichewa reviewer with agricultural knowledge must approve taxonomy display names and safety-critical treatment wording before release.
6. Tests should verify requested-language propagation, response-language metadata, fallback behaviour, and that machine identifiers remain unchanged.

## Suggested implementation sequence

1. Team agreement on the request/response fields and ownership has been reported.
2. Members 3 and 4 propose Chichewa taxonomy display names and arrange fluent-speaker review.
3. Member 3 implements language-aware advisory, treatment, planting, and recommendation text while preserving agreed response shapes.
4. Member 1 updates API validation/forwarding and integration tests.
5. Member 2 updates UI rendering and fallback notices based on the actual response metadata.
6. Run full integration tests and obtain language review before marking Chichewa support production-ready.

## Current limitation

The advisory service currently returns English for Chichewa requests and marks this with `language: "en"` and `language_fallback: true`. The taxonomy still contains `ny: null` for its initial disease and pest labels. This implementation provides transparent fallback handling; it does not yet provide translated AI advice or reviewed Chichewa taxonomy labels.
