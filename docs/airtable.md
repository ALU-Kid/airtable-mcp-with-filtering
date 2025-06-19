# Airtable MCP Usage

## list_records options

- `filterByFormula` - Airtable formula to filter results
- `autoPaginate` - fetch all pages until complete
- `sort` - array of `{ field, direction }`
- `limit` - maximum records to return

## Example with date range

```
{
  "name": "list SP Kanombe May",
  "tool": "list_records",
  "arguments": {
    "base_id": "app...",
    "table_name": "Public Charging Sessions",
    "filterByFormula": "AND({Charger Name}='SP Kanombe', DATETIME_PARSE({Date}) >= '2025-05-01', DATETIME_PARSE({Date}) <= '2025-05-31')",
    "autoPaginate": true
  }
}
```
