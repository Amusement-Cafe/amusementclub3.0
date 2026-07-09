# API Documentation

REST API for managing cards, collections, items, user preferences, inventory, and user card data.

---

# Authentication

All endpoints except the public routes require an authorization header.

### Header

```http
Authorization: <WEBHOOK_AUTH_TOKEN>
```

The token must match:

```javascript
ctx.config.webhooks.auth
```

If authentication fails:

```http
403 Forbidden
```

---

# Public Endpoints

These endpoints do **not** require authentication.

---

## Health Check

Returns a successful status if the API is running.

### Request

```http
GET /health
```

### Response

```http
200 OK
```

---

## Card Image Redirect

Redirects to the image associated with a card ID.

### Request

```http
GET /id/:cardID
```

Examples:

```
/id/1001
/id/1002
/id/1003.gif
```

### Behavior

- Looks up the card by `cardID`
- Determines the correct image format
- Redirects to the hosted image
- If hosted image is a gif, for discord display, .gif is required to function properly

### Responses

| Status | Description |
|---------|-------------|
|301|Redirect to image|
|404|Card not found|
|501|Invalid card ID|

---

# Authenticated Endpoints

All endpoints below require an authorization header:

```http
Authorization: <token>
```

---

# Global Data

These endpoints return cached global data.

---

## Get All Cards

```http
GET /global/cards
```

Returns:

```json
[
  ...
]
```

---

## Get Collections

```http
GET /global/collections
```

Returns:

```json
[
  ...
]
```

---

## Get Items

```http
GET /global/items
```

Returns:

```json
[
  ...
]
```

---

# User Endpoints

All user endpoints require a query parameter:

```text
?user=<USER_ID>
```

Example:

```
GET /user/preferences?user=123456789
```

If omitted:

```
400 Bad Request - user
```

If the user does not exist:

```
404 User not found
```

---

# User Preferences

## Get Preferences

```http
GET /user/preferences?user=<USER_ID>
```

Returns

```json
{
    "notify":{
        "aucCreated":true,
        "aucBidMe":true,
        "aucOutbid":true,
        "aucNewBid":true,
        "aucEnd":true,
        "announce":true,
        "daily":true,
        "completed":true,
        "effectEnd":true
    },
    "interact":{
        "canHas":true,
        "canDiff":true,
        "canSell":true,
        "alwaysForce":false
    },
    "profile":{
        "bio":"",
        "title":"",
        "color":"",
        "card":"",
        "favComplete":"",
        "favClout":""
    },
    "display":{
        "tables":"round",
        "helpImages":true
    }
}
```

---

## Update Preferences

```http
PATCH /user/preferences?user=<USER_ID>
```

### Body

```json
{
    "preferences": {
        "notify": {
          "aucCreated": false
        }
    }
}
```

Preferences are merged into the existing object using Lodash's `merge()`.

### Result

```json
{
    "notify":{
        "aucCreated":false,
        "aucBidMe":true,
        "aucOutbid":true,
        "aucNewBid":true,
        "aucEnd":true,
        "announce":true,
        "daily":true,
        "completed":true,
        "effectEnd":true
    },
    "interact":{
        "canHas":true,
        "canDiff":true,
        "canSell":true,
        "alwaysForce":false
    },
    "profile":{
        "bio":"",
        "title":"",
        "color":"",
        "card":"",
        "favComplete":"",
        "favClout":""
    },
    "display":{
        "tables":"round",
        "helpImages":true
    }
}
```

### Responses

```
200 OK
```

```
400 Bad Request - preferences
```

---

# User Inventory

## Get Inventory

```http
GET /user/inventory?user=<USER_ID>
```

Returns the user's inventory.

### Response
```http
200 OK
```

### Returns
```json
[
  ...
]
```

---

## Remove Inventory Item

```http
DELETE /user/inventory?user=<USER_ID>
```

### Body
```json
{
  "id": "<GENERATED_ITEM_ID>"
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Item removed|
|400|Missing item id|
|404|Item not found|

---

# User Cards

## Get User Cards

```http
GET /user/cards?user=<USER_ID>
```

### Body (Optional)
```json
{
    "cards": [
        1,
        2,
        3,
        3
    ]
}
```

Returns every card owned by the user. If a body containing an array of cardIDs is provided, the returned user cards will only match the provided cardIDs if they own them.

Yes, this isn't exactly kosher. No, I don't plan to change it to params because we have 30k+ cards now. ElasticSearch does it and it works for them. If needed I will add a POST request for the same thing to support a backend not allowing bodies on GET

---

## Add User Cards

```http
PUT /user/cards?user=<USER_ID>
```

Add cards by card ID, if attempting to add multiple of the same card, send multiple of the same ID in the array
### Body

```json
{
    "cards": [
        1,
        2,
        3,
        3
    ]
}
```

### Responses

```
200 OK
```

```
400 Bad Request - cards
```

---

## Delete Cards

```http
DELETE /user/cards?user=<USER_ID>
```

### Body

```json
{
    "cards": [
        {
            "...": "..."
        }
    ]
}
```

> **Note**
>
> This endpoint is currently a placeholder. It validates the request body and returns `200 OK`, but card removal has not yet been implemented.

---

# Error Codes

| Status | Meaning |
|---------|---------|
|200|Success|
|301|Redirect|
|400|Bad request|
|403|Forbidden|
|404|Resource not found|
|501|Invalid request|

---

# Middleware Flow

Requests pass through middleware in the following order:

```
Public Routes
      │
      ▼
Authorization Check
      │
      ▼
User Validation
      │
      ▼
JSON Body Parser
      │
      ▼
Route Handler
```


---

# Notes

- `/health` and `/id/:cardID` are public.
- Every other endpoint requires authorization.
- All `/user/*` endpoints require a valid `user` query parameter.
- Card images are hosted externally and served through HTTP redirects.