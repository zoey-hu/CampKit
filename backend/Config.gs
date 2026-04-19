var APP_CONFIG = {
  spreadsheetId: '1JD8mO3fzBC0ve1Y0w-CvKYwLg9NRFJLOLe5EjHteEUA',
  sheets: {
    gear_items: {
      name: 'gear_items',
      idField: 'gear_id',
      headers: [
        'gear_id',
        'name',
        'category',
        'quantity',
        'location',
        'status',
        'is_essential',
        'season_tags',
        'weather_tags',
        'notes',
        'created_at',
        'updated_at'
      ]
    },
    trips: {
      name: 'trips',
      idField: 'trip_id',
      headers: [
        'trip_id',
        'camp_name',
        'start_date',
        'end_date',
        'people_count',
        'children_count',
        'camp_type',
        'cooking',
        'has_power',
        'with_pet',
        'region_type',
        'weather_summary',
        'created_at',
        'updated_at'
      ]
    },
    trip_checklist: {
      name: 'trip_checklist',
      idField: 'row_id',
      headers: [
        'row_id',
        'trip_id',
        'gear_id',
        'item_name',
        'is_required',
        'is_packed',
        'missing',
        'reason',
        'note',
        'created_at',
        'updated_at'
      ]
    },
    rules: {
      name: 'rules',
      idField: 'rule_id',
      headers: [
        'rule_id',
        'condition_type',
        'condition_value',
        'action_type',
        'action_value',
        'note'
      ]
    }
  },
  enums: {
    gearStatus: ['ready', 'needs_repair', 'missing', 'retired'],
    gearCategories: [
      'sleeping',
      'shelter',
      'cooking',
      'kitchen',
      'lighting',
      'clothing',
      'furniture',
      'safety',
      'pet',
      'misc'
    ],
    campTypes: ['tent', 'rv', 'cabin', 'glamping'],
    regionTypes: ['mountain', 'forest', 'lake', 'coastal', 'plain']
  },
  checklist: {
    cookingCategories: ['cooking', 'kitchen'],
    supportedRuleActionTypes: ['include_category', 'require_item_name']
  }
};
