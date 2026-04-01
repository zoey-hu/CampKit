# Checklist Rules

## Implemented MVP Rules

1. Include every gear item where `is_essential = true`
2. If `trip.cooking = true`, include gear in `cooking` and `kitchen` categories
3. Apply matching `rules` rows using the supported rule format
4. Mark an item as `missing = true` when the rule requires an item or category that is not present in inventory
5. Deduplicate checklist entries by `gear_id` or by missing item name
6. Store the inclusion explanation in `reason`
7. Regeneration replaces prior checklist rows for the same trip to prevent duplicates

## Checklist Generation Flow

1. Read the trip by `trip_id`
2. Read all gear inventory rows
3. Read rules
4. Collect required checklist candidates
5. Deduplicate candidates
6. Delete existing checklist rows for the trip
7. Write the generated checklist rows
8. Return the checklist rows in the API response

## Future Weather Rule Direction

- Add new condition types such as `weather_contains`, `temperature_below`, and `wind_above`
- Support rule composition for multiple trip and weather conditions
- Add explicit inventory substitution logic for missing weather gear
- Introduce recommendation-only checklist rows separate from required rows
