# CampKit API Contract

All API responses use a consistent JSON envelope.

## Success

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

## Failure

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Supported Actions

### Gear

- `gear_list`
- `gear_create`
- `gear_update`
- `gear_delete`

### Trips

- `trip_list`
- `trip_create`
- `trip_update`

### Checklist

- `generate_checklist`
- `checklist_get`
- `checklist_toggle_packed`

## Example Payloads

### `gear_create`

```json
{
  "action": "gear_create",
  "name": "Headlamp",
  "category": "lighting",
  "quantity": 2,
  "location": "Garage shelf",
  "status": "ready",
  "is_essential": true,
  "season_tags": "spring, autumn",
  "weather_tags": "night, rain",
  "notes": "Keep extra batteries nearby"
}
```

### `trip_update`

```json
{
  "action": "trip_update",
  "trip_id": "trip_001",
  "camp_name": "Pine Ridge Camp",
  "cooking": true,
  "with_pet": false
}
```

### `checklist_toggle_packed`

```json
{
  "action": "checklist_toggle_packed",
  "row_id": "chk_001",
  "is_packed": true
}
```
