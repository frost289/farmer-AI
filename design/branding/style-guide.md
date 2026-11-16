# FarmAI Style Guide (Member 5 owns this file)

Starting point implemented in `web/tailwind.config.js`. Update both together.

## Colours

| Name | Hex | Use |
|---|---|---|
| Brand 600 | `#16844a` | Primary buttons, links, header accents |
| Brand 700 | `#126a3d` | Hover, headings on light backgrounds |
| Brand 50 / 100 | `#f0fdf4` / `#dcfce7` | Backgrounds, highlights |
| Soil 500 | `#8b6b4a` | Secondary accent (earth tone) |
| Warning | amber 100 / 800 | "Wait", low confidence |
| Danger | red 100 / 800 | High severity, errors |

## Typography

System font stack for fast loading on slow networks. Base size 16 px. Never go below 14 px.

## Low-literacy and accessibility rules

- Every action has an icon **and** a short text label.
- Touch targets at least 44 x 44 px.
- One main action per screen; plain words, no jargon.
- Verdicts use colour **and** an icon **and** text (colour alone is not enough).
- Photos and results work on small phone screens first (mobile first).
- Error messages say what to do next ("Take a clearer photo in daylight").
- Contrast ratio at least 4.5:1 for text.

## Logo

`logo/farmai-logo.svg` is a placeholder (green rounded square with a sprout). Replace with the final logo.
