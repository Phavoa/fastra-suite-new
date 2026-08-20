You are senior frontend developer. You want to approve a submitted vendor bill in the payment queue. you got this error message from backend
{
    "error": [
        {
            "error": "No active account mapping exists for request type 'purchase'."
        }
    ]
}
You want to implement account mapping configuration in the settings of inVoicing module according to PRD - PRD\FastraSuite PRD Addendum.md section 9.
The endpoints are in - src\api\invoice\requestAccountMappingsApi.ts
follow the same style and color like existing code in settings

### The backend developer gave hint below
payload structure
{
  "request_type": "purchase",
  "expense_account": 15
}
request_type → must be one of the values defined in your REQUEST_TYPE_CHOICES.

REQUEST_TYPE_CHOICES = [
    ("labour", "Labour"),
    ("purchase", "Purchase"),
    ("subcontractor", "Subcontractor"),
    ("plant_equipment", "Plant & Equipment"),
    ("material_consumption", "Material Consumption"),
]
expense_account → must be the ID of an existing ChartOfAccount whose account_type is "EXPENSE".