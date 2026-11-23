# FarmAI Weather Data Integration Review

**Status:** Technical investigation; no provider has been selected for production yet.  
**Scope:** Malawi-first farm-level forecasts and agricultural weather advice.

## Current implementation

The API currently requests a seven-day forecast from Open-Meteo using farm coordinates. Results are cached for three hours by coordinates rounded to two decimal places. If the provider request fails, the API returns a stale cached forecast when one exists.

This is a useful fallback, but it is not yet a complete farm-weather intelligence system:
- The current UI shows daily rainfall and maximum temperature only.
- The cache key rounds coordinates to roughly kilometre-scale cells; it should not be presented as a precise measurement at an individual field.
- The application does not yet expose source, forecast issue time, observation time, or a data-quality indicator to farmers.
- Weather data is not yet fused with satellite-derived rainfall/vegetation indicators.

## Provider investigation

### 1. MaDiPHS / NIBIO Weather Integration Platform — preferred first technical evaluation

Documentation:
- https://integration.madiphs.org/
- https://integration.madiphs.org/api/weather/introduction
- https://integration.madiphs.org/api/weather/getting-started
- https://integration.madiphs.org/api/weather/amalgation-service

The public documentation describes a weather-source catalogue and an amalgamation service intended to combine available sources for a coordinate. The getting-started guide lists:
- DCCMS location forecast for Malawi (five-day forecast).
- Met Norway Locationforecast (global forecast; documentation notes approximately 9 km resolution outside the Nordic-Baltic region).
- TAHMO weather stations.
- Open-Meteo.

The MaDiPHS platform also describes access to Malawi historical weather and climate datasets. Its national client describes integration of weather data, satellite observations, pest surveillance and decision-support systems.

**Why evaluate it first:** it offers a Malawi-relevant discovery/aggregation layer and may reduce the work of integrating several providers independently.

**Before production use, verify:** current API availability and uptime, authentication requirements, request limits, permitted commercial use, attribution requirements, data freshness, exact response schema, source provenance, and whether the amalgamation endpoint is suitable for automated high-volume app requests. Public documentation alone does not establish an SLA or guaranteed farm-level accuracy.

### 2. DCCMS — authoritative national partner to approach

Official information:
- https://www.metmalawi.gov.mw/faqs/
- https://www.metmalawi.gov.mw/products/
- https://www.metmalawi.gov.mw/data-requests/

DCCMS publishes daily and five-day forecasts, ten-day agro-meteorological bulletins, seasonal forecasts and weather alerts. Its FAQ explicitly asks developers wishing to integrate meteorological data into an app or website to contact DCCMS.

**Action:** contact DCCMS to confirm access conditions, data licensing, attribution, update cadence and the correct operational feed. Do not scrape public pages as a substitute for an agreed data interface.

### 3. Open-Meteo — retain as initial fallback

Documentation:
- https://open-meteo.com/en/docs

It is already integrated and does not require an API key for the current basic use. Keep it as a fallback while evaluating Malawi-specific sources. Confirm the applicable terms and usage limits before production scale or commercial use.

### 4. Satellite data — separate phase, not a replacement for forecasts

Potential datasets to evaluate include satellite-derived rainfall estimates and vegetation indices. These can support historical rainfall context, vegetation-condition monitoring and regional anomaly detection. They are not equivalent to a live field weather station:
- Satellite products may be delayed, composited or model-derived.
- Cloud cover, spatial resolution and revisit interval affect usability.
- Vegetation indices indicate changes in vegetation condition; they do not diagnose a particular pest or disease.
- Satellite rainfall estimates should be compared with ground observations where possible.

Do not label satellite-derived estimates as exact live rainfall at a farmer's field.

## Recommended target design

1. Store the farmer-confirmed farm coordinates and district in the FarmAI API.
2. Fetch provider data server-side; never expose provider credentials in the browser.
3. Normalize provider responses into one internal weather contract.
4. Store provider/source name, fetched timestamp, forecast issue timestamp (when supplied), observation timestamp (when supplied), and quality/staleness metadata.
5. Cache forecasts and retain the last usable response for low-connectivity periods.
6. Show farmers simple, actionable summaries with clear freshness labels.
7. Feed validated weather variables and crop stage into advisory logic; avoid generating high-confidence planting instructions from a single uncertain forecast.

## Farm location UX decision

Farmers should not be required to know or type latitude/longitude. The first implementation should:
- Offer an explicit **Use my current location** action.
- Explain why location is requested and ask browser permission only after the farmer taps.
- Make location optional at farm creation; the farmer can add it later.
- Keep district selection as the non-GPS fallback.
- Store coordinates silently in the existing `lat` and `lng` fields.
- Make it clear that phone location should be captured while the farmer is at the farm, and allow it to be removed or recaptured.

A map pin and searchable traditional-authority/village directory are follow-up improvements. They should only be added once a dependable Malawi boundary/place dataset and map provider are selected.

## Immediate next steps

1. Manually test GPS permission granted, denied, unavailable, timeout, and location removal in the Codespaces-hosted app.
2. Confirm a farm can be saved without coordinates and that weather/planting screens explain why a location is needed.
3. Prototype MaDiPHS responses for at least one northern, central and southern Malawi coordinate; compare source metadata and freshness with Open-Meteo.
4. Contact DCCMS about an official app integration feed and licensing.
5. Decide provider priority/fallback only after these checks; then implement a normalized API adapter and tests.

## References

- MaDiPHS Integration Platform: https://integration.madiphs.org/
- MaDiPHS weather API introduction: https://integration.madiphs.org/api/weather/introduction
- MaDiPHS weather API getting started: https://integration.madiphs.org/api/weather/getting-started
- MaDiPHS amalgamation service: https://integration.madiphs.org/api/weather/amalgation-service
- DCCMS FAQs and data access: https://www.metmalawi.gov.mw/faqs/
- DCCMS products: https://www.metmalawi.gov.mw/products/
- Open-Meteo documentation: https://open-meteo.com/en/docs

## Live API smoke-test findings — 23 November 2026

A live check of the MaDiPHS/NIBIO endpoints was attempted before selecting it as a production provider.

### What was confirmed

- The location-specific weather-source catalogue endpoint responded successfully for the documented Lilongwe-area coordinate `latitude=-13.995720`, `longitude=33.759819`.
- That location-specific response listed two active location sources: Met Norway Locationforecast (nine days) and Open-Meteo (eight days). It did **not** return the DCCMS location forecast in that response.
- The general source catalogue lists DCCMS Locationforecast as an active Malawi-only source with a five-day forecast, but this is not proof that the source is currently returned or usable for every location.
- The source catalogue reports TAHMO as station-based and credential-protected; its metadata flags that data may need quality control. It should not be treated as a no-credentials live feed.
- The documented amalgamation request for Lilongwe timed out during this check. This is an inconclusive availability result, not proof that the service is permanently unavailable.
- The public getting-started documentation identifies the source metadata fields (authentication type, active state, forecast horizon, interval, parameters, spatial coverage and quality-control flag). These should be inspected at runtime rather than hard-coded.

### Decision

**Do not replace the working Open-Meteo integration yet.** The live checks do not establish that the amalgamation endpoint is reliable enough for a farmer-facing production dependency, and the documented DCCMS source was absent from the tested location-specific source list.

The next safe engineering step is a non-production adapter spike with:
1. strict request timeouts and response validation;
2. source name, provider timestamp, fetch timestamp and quality metadata retained;
3. a bounded cache and explicit stale-data flag;
4. fallback to the existing Open-Meteo provider whenever MaDiPHS is unavailable, malformed or stale;
5. tests using recorded provider responses, including missing fields and timeout cases.

Before enabling this adapter for farmers, repeat checks from the deployed API environment, test coordinates in northern, central and southern Malawi, verify actual returned forecast dates/units, and obtain written confirmation of API usage and attribution terms. Contact DCCMS separately for an official integration feed and its conditions. No production provider switch is approved by this investigation.


## Crop-aware weather advice — scope and evidence requirements

The initial FarmAI crop catalogue contains maize, rice, groundnut, soybean, tobacco, cassava, sweet potato, beans, cotton, tomato and pigeon pea. The current seven-day weather summary is deliberately a **general farm weather watch** for every crop recorded on a farm. Its simple dry-spell, heavy-rain and high-temperature triggers are not crop-specific agronomic thresholds and must not be presented as planting recommendations.

### Evidence sources identified

- The Malawi Ministry of Agriculture / Department of Agricultural Research Services published a 2025 compilation of extension circulars covering released crop varieties, fertilizers and cropping systems. These circulars are useful primary sources for variety-specific recommendations and are approved through the Agricultural Technology Clearing Committee. Source: https://agriculture.gov.mw/files/medias/ministry-of-agriculture-recommended-crops-fertilizers-and-cropping-systems-1744366276.pdf
- The MaDiPHS Knowledge Library identifies the Ministry of Agriculture's *Guide to Agriculture Production and Natural Resources Management in Malawi* as a Malawi-specific technical reference. However, its listed licence is **Other (Non-Commercial)**. Do not copy, redistribute, embed or use its content in a monetized FarmAI knowledge base until the rights holder grants written permission or legal review confirms a permitted use. Source: https://ckan.madiphs.org/en_GB/plant-health-knowledge-product/guide-to-agriculture-productionand-natural-resources-managementin-malawi
- The World Bank Malawi Climate-Smart Agriculture profile provides useful country context and crop practices, but it is not a substitute for current variety- and stage-specific recommendations from Malawi's extension authorities. Source: https://climateknowledgeportal.worldbank.org/sites/default/files/2019-06/CSA%20_Profile_Malawi.pdf

### Safe implementation sequence

1. Keep general forecast summaries and weather watches available for all eleven crops.
2. Build a structured agronomy evidence register per crop and, where evidence supports it, per variety. Record the recommendation, crop stage, agro-ecological applicability, source title, issuing authority, publication date, page/section, review date, and permitted-use/licensing status.
3. Ask DARS/DAES or qualified Malawi agronomists to review thresholds before they are used to trigger farmer-facing advice. Do not infer a universal threshold from a single variety, district or research trial.
4. Collect crop stage and planting date (and irrigation/rainfed status where relevant) before issuing crop-specific advice. A crop name alone is insufficient to infer its current water needs.
5. Separate short-range forecast alerts from seasonal outlooks and observed conditions. A seven-day forecast cannot establish whole-season suitability or guarantee planting success.
6. If evidence is missing, show a general weather alert and explain its limits; do not invent a crop-specific recommendation.

### Current data gap

The current weather API contract provides daily rainfall and maximum temperature only. Before implementing richer crop-stage advice, evaluate whether minimum temperature, humidity, wind and observed rainfall are available and sufficiently reliable from the selected provider. Do not assume that forecast rainfall equals field soil moisture; soil texture, drainage, slope, previous rainfall and irrigation also matter.

### Review decision

Support all eleven crops in the product experience, but release crop-specific weather thresholds only when each rule has a traceable, legally usable source and review by a qualified agronomist. This staged approach avoids giving unsupported advice merely to claim complete crop coverage.
