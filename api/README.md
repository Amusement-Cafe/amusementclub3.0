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
# Card Endpoints
All card endpoints require a query parameter
```http
?cardID=CARDID
```

Example:
```
GET /card/eval?cardID=123456
```

If omitted:
```
400 Bad Request - card ID
```

If the card doesn't exist:
```
404 - Card Not Found
```
---
## Get Eval
```
GET /card/eval?cardID=<CARD_ID>
```

Returns:
```
"100"
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
Remove cards by card ID, if attempting to remove multiple of the same card, send multiple of the same ID in the array
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

# User Balances

## Add/Subtract Tomatoes
```http
POST /user/tomatoes?user=<USER_ID>
```
---
## Add/Subtract Lemons
```http
POST /user/lemons?user=<USER_ID>
```
---
## Add/Subtract PromoBal
```http
POST /user/promo?user=<USER_ID>
```
---

All 3 of the above take the same body. If removing from a balance, make the amount negative. Otherwise, keep it positive to add.
### Body
```json
{
    "amount": -1000
}
```
### Responses
```
200 OK
```

```
400 Bad Request - amount
```
---

# User Card Favorites

## Toggle Card Favorite

```http
PATCH /user/cards/fav?user=<USER_ID>
```

Toggles the `fav` boolean on the user's card.

### Body
```json
{
    "cardID": 1234
}
```

### Response
```json
{
    "fav": true
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Toggled successfully, returns new value|
|400|Missing cardID|
|404|Card not in user's collection|

---

# Card Editing

## Edit Card Metadata & Tags

```http
PATCH /user/cards/edit?user=<USER_ID>
```

Updates a card's displayName, meta fields, and manages tags. Requires `metamod`, `tagmod`, or `admin` role.

### Body
```json
{
    "cardID": 1234,
    "displayName": "New Name",
    "meta": {
        "booruID": 12345,
        "booruScore": 100,
        "artist": "artist_name"
    },
    "tagsToAdd": ["tag1", "tag2"],
    "tagsToRemove": ["old_tag"]
}
```

All fields except `cardID` are optional.

### Responses

| Status | Description |
|---------|-------------|
|200|Updated successfully|
|400|Missing cardID|
|403|Insufficient role|
|404|Card not found|

---

# User Wishlist

## Add to Wishlist

```http
POST /user/wishlist?user=<USER_ID>
```

### Body
```json
{
    "cardID": "1234"
}
```

Note: cardID is a **string** in wishlists.

### Responses

| Status | Description |
|---------|-------------|
|200|Added|
|400|Missing cardID|
|409|Already wishlisted|

---

## Remove from Wishlist

```http
DELETE /user/wishlist?user=<USER_ID>
```

### Body
```json
{
    "cardID": "1234"
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Removed|
|400|Missing cardID|
|404|Not found|

---

# Auction Bidding

## Place Bid

```http
POST /user/auction/bid?user=<USER_ID>
```

Places a bid on an active auction. Handles refunding the previous bidder and deducting tomatoes atomically.

### Body
```json
{
    "auctionID": "abc123",
    "amount": 500
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Bid placed|
|400|Missing fields or bid too low|
|402|Insufficient tomatoes|
|404|Auction not found|
|409|Auction ended or cancelled|

---

# Hero Selection

## Set User Hero

```http
PATCH /user/hero?user=<USER_ID>
```

### Body
```json
{
    "heroID": "hero_abc"
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Hero updated|
|400|Missing heroID|

---

# Plot Collection

## Collect Plot Lemons

```http
POST /user/plots/collect?user=<USER_ID>
```

Collects all stored lemons from user's plots in a guild and adds them to the user's balance.

### Body
```json
{
    "guildID": "123456789"
}
```

### Response
```json
{
    "collected": 150
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Collected (returns amount)|
|400|Missing guildID|

---

# Store Purchase

## Purchase Item

```http
POST /user/store/purchase?user=<USER_ID>
```

Purchases a store item. Deducts tomatoes, creates inventory item, and updates purchase stats atomically.

### Body
```json
{
    "itemID": "ticket_1"
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Purchased|
|400|Missing itemID|
|402|Insufficient tomatoes|
|404|Item not found|

---

# Claims

## Claim Cards

```http
POST /user/claim?user=<USER_ID>
```

Performs a gacha claim. Calculates price, draws random cards from the appropriate pool, deducts tomatoes, updates claim stats, creates a claim record, and adds cards to the user's collection.

### Body
```json
{
    "bannerID": "standard",
    "amount": 3
}
```

`bannerID` is `"standard"` for normal claims or a promo/collection ID for promo claims. `amount` must be 1-10.

### Response
```json
{
    "cards": [1234, 5678, 9012],
    "cost": 450
}
```

### Responses

| Status | Description |
|---------|-------------|
|200|Claimed (returns drawn cards and cost)|
|400|Invalid bannerID/amount or no cards in pool|
|402|Insufficient tomatoes|

---

# Admin Endpoints

All admin endpoints require the requesting user (`?user=`) to have the `admin` role. Target user is specified in the body.

---

## Set User Balances

```http
POST /user/admin/balances?user=<ADMIN_USER_ID>
```

### Body
```json
{
    "targetUserID": "123456789",
    "tomatoes": 5000,
    "lemons": 100,
    "vials": 50
}
```

---

## Give Card to User

```http
PUT /user/admin/card?user=<ADMIN_USER_ID>
```

### Body
```json
{
    "targetUserID": "123456789",
    "cardID": 1234
}
```

---

## Give Item to User

```http
POST /user/admin/item?user=<ADMIN_USER_ID>
```

### Body
```json
{
    "targetUserID": "123456789",
    "type": "ticket",
    "itemID": "ticket_1"
}
```

---

## Reset User Daily

```http
POST /user/admin/resetdaily?user=<ADMIN_USER_ID>
```

### Body
```json
{
    "targetUserID": "123456789"
}
```

### Admin Responses (all endpoints)

| Status | Description |
|---------|-------------|
|200|Success|
|400|Missing required fields|
|403|Not admin|
|404|Target user not found|

---
# Error Codes

| Status | Meaning |
|---------|---------|
|200|Success|
|301|Redirect|
|400|Bad request|
|402|Insufficient balance|
|403|Forbidden|
|404|Resource not found|
|409|Conflict|
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
- Admin endpoints additionally check the requesting user's `roles` array for `admin`.