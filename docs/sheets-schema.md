# Google Sheets Schema

Create the following sheets with these exact header rows.

## `gear_items`

```text
gear_id,name,category,quantity,location,status,is_essential,season_tags,weather_tags,notes,created_at,updated_at
```

## `trips`

```text
trip_id,camp_name,start_date,end_date,people_count,children_count,camp_type,cooking,has_power,with_pet,region_type,weather_summary,created_at,updated_at
```

## `trip_checklist`

```text
row_id,trip_id,gear_id,item_name,is_required,is_packed,missing,reason,note,created_at,updated_at
```

## `rules`

```text
rule_id,condition_type,condition_value,action_type,action_value,note
```

## Current Supported Rule Format

### `condition_type`

- `trip_field_equals`

### `condition_value`

- Format: `field_name:value`
- Example: `cooking:true`
- Example: `with_pet:true`

### `action_type`

- `include_category`
- `require_item_name`

### `action_value`

- For `include_category`, use a gear category such as `cooking`
- For `require_item_name`, use the exact item name you want enforced
