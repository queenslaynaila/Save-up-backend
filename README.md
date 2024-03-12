# Users
- [Users](#users)
  - [Endpoints](#endpoints)
    - [1. updateUserPhoneNo](#1-updateuserphoneno)
    - [2. getUserByScope](#2-getuserbyscope)
    - [3. Signout](#3-signout)
    - [4. UpdateUser](#4-updateuser)
    - [5. createUser](#5-createuser)
    - [6. Login](#6-login)
- [Savings](#savings)
  - [Endpoints](#endpoints-1)
    - [1. getSavingsByConditions](#1-getsavingsbyconditions)
    - [2. deleteSaving](#2-deletesaving)
    - [3. updateSaving](#3-updatesaving)
    - [4. getSavingbySavingId](#4-getsavingbysavingid)
    - [5. createSaving](#5-createsaving)
    - [6. getAllSavings](#6-getallsavings)
- [Contributions](#contributions)
  - [Endpoints](#endpoints-2)
    - [1. getContributionsByConditions](#1-getcontributionsbyconditions)
    - [2. getContributionById](#2-getcontributionbyid)
    - [3. createContribution](#3-createcontribution)
- [expenses](#expenses)
  - [Endpoints](#endpoints-3)
    - [1. getExpenseByConditions](#1-getexpensebyconditions)
    - [2. updateExpense](#2-updateexpense)
    - [3. DeleteExpense](#3-deleteexpense)
    - [4. createExpense](#4-createexpense)
- [Categories](#categories)
  - [Endpoints](#endpoints-4)
    - [1. updateCategories](#1-updatecategories)
    - [2. getCategoriesByConditions](#2-getcategoriesbyconditions)
    - [3. deleteCategory](#3-deletecategory)
    - [4. createCategories](#4-createcategories)
- [SecurityQuestions](#securityquestions)
  - [Endpoints](#endpoints-5)
    - [1. getAllSecurityQuestions](#1-getallsecurityquestions)
- [Answers](#answers)
  - [Endpoints](#endpoints-6)
    - [1. createSecurityAnsswer](#1-createsecurityansswer)
- [Password](#password)
  - [Endpoints](#endpoints-7)
    - [1. updatePassword](#1-updatepassword)
    - [2. Forgetpassword request](#2-forgetpassword-request)
    - [3 verifyPasswordResetToken](#3-verifypasswordresettoken)
    - [3. verifySecurityAnser](#3-verifysecurityanser)
    - [4. resetPassword](#4-resetpassword)

## Endpoints
### 1. updateUserPhoneNo
***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: https://save-up-3w7t.onrender.com/users/update-phone/e3a818c6-2d3f-49b5-a716-a97b8fd4c009
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTAyMzQ2NTV9.gVtpGJNoQYu2GfMHgB1B_ixlDlA2htXpNG_hSXEf0nY |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTA3NTMwNTV9.Obl2XR1gyRWyjhTha8de4rqMSprTwgYR2U2yJrSgLW0 |  |

***Body:*** The new phone number along with password
```js        
{
  "phone_number": "+254722830838",
  "password": "Jemanaila@2000"
}
```
***Success Response:***
The new phone number 
```js        
{
  "phone_number": "+254722830838",
}
```

### 2. getUserByScope
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/users/{scope}

```
***Request Parameters***
Scope:A string parameter indicating the user's identifier. It can be:
- `me`: Retrieves information about the currently logged-in user.Can be used by all users
- `all`: Retrieves information about all users (requires Admin or Moderator role).
- `UserID`: Retrieves information about a specific user based on their ID(requires Admin or Moderator role).

***Query Parameters***:
- `role` (optional): Filter users by their role. Acceptable values are `User`, `Admin`, or `Moderator`.

***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTAyMzQ2NTV9.gVtpGJNoQYu2GfMHgB1B_ixlDlA2htXpNG_hSXEf0nY |  |
| refresh-Token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTA3NTMwNTV9.Obl2XR1gyRWyjhTha8de4rqMSprTwgYR2U2yJrSgLW0 |  |

***SampleResponse:*** when all is used.With me its just an array of one object rep the logged in user,sane with userid one obje rep the user searched
```json
[
  {
    "id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
    "first_name": "Queenslay",
    "last_name": "Jema",
    "phone_number": "+254713518356",
    "role": "User",
    "created_at": "2024-03-11T08:55:49.193Z",
    "updated_at": "2024-03-11T08:55:49.193Z"
  },
  {
    "id": "a97b8fd4c009-e3a818c6-2d3f-49b5-a716",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "role": "Admin",
    "created_at": "2024-03-11T08:55:49.193Z",
    "updated_at": "2024-03-11T08:55:49.193Z"
  }
]
```

### 3. Signout
***Endpoint:***

```bash
Method: POST
Type: 
URL: https://save-up-3w7t.onrender.com/users/signout
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTAyMzQ2NTV9.gVtpGJNoQYu2GfMHgB1B_ixlDlA2htXpNG_hSXEf0nY |  |
| refresh-Token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTA3NTMwNTV9.Obl2XR1gyRWyjhTha8de4rqMSprTwgYR2U2yJrSgLW0 |  |

***Sample Success Response:***
```json
{
  "message": "Logout successful"
}
```

### 4. UpdateUser
***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: https://save-up-3w7t.onrender.com/users/e3a818c6-2d3f-49b5-a716-a97b8fd4c009
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTAyMzQ2NTV9.gVtpGJNoQYu2GfMHgB1B_ixlDlA2htXpNG_hSXEf0nY |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTQ4MjU1LCJleHAiOjE3MTA3NTMwNTV9.Obl2XR1gyRWyjhTha8de4rqMSprTwgYR2U2yJrSgLW0 |  |

***Body:***
The first_name and last_name fields are optional. You can provide either or both of them in the request body.

```js        
{

    "last_name": "string"
    "first_name":"string"
}
```

***Success:***

```js        
{
  "id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
  "first_name": "Queenslay",
  "last_name": "Tembo",
  "phone_number": "+254713518356",
  "role": "User",
  "password": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
  "created_at": "2024-03-11T08:55:49.193Z",
  "updated_at": "2024-03-11T08:55:49.193Z"
}
```

### 5. createUser
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/users/
```
***Body:***

```js        
{
  "first_name": "Queenslay",
  "last_name": "Jema",
  "phone_number": "+254713518356",
  "password": "sampleePassword"
}

```
***Sucess Response:***
```js        
{
  "id": "ddba4643-fa09-42d0-9480-90a5d5a48cc8",
  "first_name": "Queenslay",
  "last_name": "Jema",
  "phone_number": "+254713518354",
  "role": "User",
  "created_at": "2024-03-11T13:23:33.149Z",
  "updated_at": "2024-03-11T13:23:33.149Z"
}

```
***Error Response:***
```js        
{
  "error": "An account with the provided phone number already exists" or "Internal server error"
}
```


### 6. Login
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/users/signin
```
***Body:***

```js        
{
 "phone_number": "+254713518356",
  "password": "Jemanaila@2000"
}

```
---

# Savings
## Endpoints
### 1. getSavingsByConditions
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/savings/{scope}
```

***Request Parameters***
Scope: A string parameter indicating the savings identifier. It can be::
- `me`: Retrieves information about the currently logged-in user's savings.Can be used by all users
- `all`: Retrieves information about all savings (requires Admin or Moderator role)..
- `SavingsId`: Retrieves information about savings based on their ID.

***Query Parameters***:
- `category_id` (optional): Filter savings by category ID.
- `priority` (optional): Filter savings by priority. Acceptable values are High, Intermediate, or Low.
- `status` (optional): Filter savings by status. Acceptable values are In Progress, Dormant, or Completed.
  
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

  
***Sample Response:***  
```json
[
  {
    "id": "1",
    "user_id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
    "category_id": "2",
    "amount": 5000,
    "priority": "High",
    "status": "In Progress",
    "created_at": "2024-03-11T08:55:49.193Z",
    "updated_at": "2024-03-11T08:55:49.193Z"
  },
  {
    "id": "2",
    "user_id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
    "category_id": "1",
    "amount": 3000,
    "priority": "Low",
    "status": "Completed",
    "created_at": "2024-03-11T08:55:49.193Z",
    "updated_at": "2024-03-11T08:55:49.193Z"
  }
]
```

### 2. deleteSaving
***Endpoint:***

```bash
Method: DELETE
Type: 
URL: https://save-up-3w7t.onrender.com/savings/473d3361-d5d0-4794-bce7-10950e14d992
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

**Success Response:**
```json
{
  "message": "Savings deleted successfully"
}
```
**Error Response:**
```json
{
  "error": "Savings not found" or "Invalid Saving id" 
}
```

### 3. updateSaving
***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: https://save-up-3w7t.onrender.com/savings/05799423-5268-4173-bb4a-d6c659b72d0c
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***
- description (optional): A string representing the updated description of the saving.
- category_id (optional): A string representing the updated category ID of the saving.
- amount (optional): A number representing the updated amount of the saving.
- priority (optional): A string representing the updated priority of the saving.
- target_date (optional): A string representing the updated target date of the saving.

```js        
{
  "priority":"High"
}
```

**Success Response:**
```json
{
  "id": "saving_id",
  "description": "Updated description",
  "category_id": "Updated category ID",
  "amount": 1000,
  "priority": "Updated priority",
  "target_date": "Updated target date"
}
```
### 4. getSavingbySavingId
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/savings/records/05799423-5268-4173-bb4a-d6c659b72d0c
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |



### 5. createSaving
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/savings/
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Request Body:***
- user_id: The ID of the user associated with the saving.
- description: The description of the saving.
- category_id: The ID of the category associated with the saving.
- amount: The amount of the saving.
- priority: The priority of the saving.
- target_date: The target date for achieving the saving.

***Success Response:***
```json
{
  "id": "saving_id",
  "user_id": "user_id",
  "description": "Saving description",
  "category_id": "Category ID",
  "amount": 1000,
  "priority": "Priority",
  "target_date": "Target date",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```
### 6. getAllSavings
***Endpoint:***

```bash
Method: GET
Type: 
URL: http://localhost:3001/contributions/me
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZWUwMGUyLWZhOGYtNDJmOS1iMzAxLTUwNmJjOWIxZmUyNCIsInJvbGUiOiJtb2RlcmF0b3IiLCJpYXQiOjE3MDk2MDYwMzUsImV4cCI6MTcwOTY5MjQzNX0.HHb0uA0aFm4Q53Q6aLv8HIV3BTwLyn0NG-fHU6BytPc |  |

---

# Contributions
1. [getContributionsByConditions](#1-getcontributionsbyconditions)
2. [getContributionById](#2-getcontributionbyid)
3. [createContribution](#3-createcontribution)

## Endpoints
### 1. getContributionsByConditions
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/contributions/{scope}
```

***Request Parameters***
Scope: A string parameter indicating the contributions identifier. It can be::
- `me`: Retrieves information about the currently logged-in user's contrubution.Can be used by all users
- `all`: Retrieves information about all contributions (requires Admin or Moderator role)..
- `ContributionId`: Retrieves information about contributions based on their ID.

***Query Parameters***:
- `saving_id` (optional): Filter contributions by saving ID.
- `category_id` (optional): Filter contributions by category. 
- `month` (optional): Filter contributions by month.

***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

### 2. getContributionById
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/contributions/records/b3bba124-a70f-4fb8-9506-a9e5d3e712b9
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Success Response:***
```json
{
  "id": "contribution_id",
  "saving_id": "saving_id",
  "amount": 1000,
  "date": "Contribution date",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

### 3. createContribution
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/contributions
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***

```js        
{
  "saving_id":"05799423-5268-4173-bb4a-d6c659b72d0c",
  "amount": 200,
  "date":"2024-03-29T18:52:23.369Z"
}
```
**Success Response:**
```json
{
  "id": "contribution_id",
  "saving_id": "saving_id",
  "amount": 1000,
  "date": "Contribution date",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```
# expenses
1. [getExpenseByConditions](#1-getexpensebyconditions)
2. [updateExpense](#2-updateexpense)
3. [DeleteExpense](#3-deleteexpense)
4. [createExpense](#4-createexpense)

## Endpoints
--------
### 1. getExpenseByConditions
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/expenses/{scope}
```

***Request Parameters***
Scope: A string parameter indicating the expense identifier. It can be::
- `me`: Retrieves information about the currently logged-in user's expense.Can be used by all users
- `all`: Retrieves information about all expenses (requires Admin or Moderator role)..
- `userid`: Retrieves all expenses belonging to a user.(requires Admin or Moderator role)

***Query Parameters***:
- `category_id` (optional): Filter expensess by category. 
- `month` (optional): Filter expenses by month.

***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

### 2. updateExpense
***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: https://save-up-3w7t.onrender.com/expenses/995687d9-3120-4ecc-9f13-de2f587987a1
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |
***Body:***

```js        
{
  "description":"Sample update trial"
}
```

### 3. DeleteExpense
***Endpoint:***

```bash
Method: DELETE
Type: 
URL: https://save-up-3w7t.onrender.com/expenses/7c7403eb-84d6-4d9d-9b0f-640114bd52da
```

***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

### 4. createExpense
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/expenses
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***

```js        
{
  "description": "Payment of rent",
  "category_id":"49d5064c-ddff-4952-9039-c7b84dddcc58" ,
  "amount":25000.50,
  "date": "2024-03-29T00:00:00Z",
  "user_id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009"
}
```
**Success Response:**
```json
{
  "id": "expense_id",
  "description": "Expense description",
  "category_id": "category_id",
  "amount": 100.50,
  "date": "2024-03-09",
  "user_id": "user_id",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

# Categories
1. [updateCategories](#1-updatecategories)
2. [getCategoriesByConditions](#2-getcategoriesbyconditions)
3. [deleteCategory](#3-deletecategory)
4. [createCategories](#4-createcategories)
## Endpoints
--------
### 1. updateCategories
***Endpoint:***

```bash
Method: PATCH
Type: RAW
URL: https://save-up-3w7t.onrender.com/categories/dcc01ca2-7f55-40ca-8f89-be91cbdf82fa
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***

```js        
{
  "name":"this is a trial update jjsss",
  "description":"another trial"
}
```

### 2. getCategoriesByConditions
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/categories/{scope}
```
***Request Parameters***
Scope: A string parameter indicating the category identifier. It can be::
- `me`: Retrieves information about the currently logged-in user's categoriwaplus system defined.Can be used by all users.If the user has none it just shows system
- `all`: Retrieves information about all categories (requires Admin or Moderator role)..
- `system`: Retrieves information about only system defined categories (requires Admin or Moderator role)..
- `userid`: Retrieves all categories belonging to a user.(requires Admin or Moderator role)

***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

### 3. deleteCategory

***Endpoint:***

```bash
Method: DELETE
Type: 
URL: https://save-up-3w7t.onrender.com/categories/{categoryid}
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

### 4. createCategories

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/categories
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***

```js        
{
  "user_id":"e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
  "description":"Purchasing my new reading collection",
  "name":"Reading"
}
```
***Success Response:***
```json
{
  "id": "category_id",
  "user_id": "user_id",
  "name": "Category name",
  "description": "Category description",
  "created_at": "Timestamp",
  "updated_at": "Timestamp"
}
```

# SecurityQuestions
1. [getAllSecurityQuestions](#1-getallsecurityquestions)
## Endpoints

### 1. getAllSecurityQuestions
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/security-questions
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

**Success Response:**
```json
[
  {
    "id": "question_id_1",
    "question": "Security question 1"
  },
  {
    "id": "question_id_2",
    "question": "Security question 2"
  },
]
```

# Answers
1. [createSecurityAnsswer](#1-createsecurityansswer)
## Endpoints
### 1. createSecurityAnsswer
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/security-answers
```
***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***

```js        
{
  "question_id":"29c1406f-ca4e-401f-aa59-2633ea67e652",
  "user_id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009",
  "answer": "Di Ziyuan"
}

```
***Success Response:***

```json
{
  "message": "Security answer created successfully"
}
```
---
# Password
1. [updatePassword](#1-updatepassword)
2. [resetPassword](#2-resetpassword)
3. [verifySecurityAnser](#3-verifysecurityanser)
4. [verifyPasswordResetToken](#4-verifypasswordresettoken)
5. [Forgetpassword request](#5-forgetpassword-request)

## Endpoints

### 1. updatePassword
***Endpoint:***

```bash
Method: GET
Type: 
URL: https://save-up-3w7t.onrender.com/password/update-password
```
 ***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| authorization | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTAyMzY1MDJ9.2Amq0FHnXndZJXi2FZBFdkDnBI-ztx5HvHG_CUviAK0 |  |
| refresh-token | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImUzYTgxOGM2LTJkM2YtNDliNS1hNzE2LWE5N2I4ZmQ0YzAwOSIsInJvbGUiOiJVc2VyIiwiaWF0IjoxNzEwMTUwMTAyLCJleHAiOjE3MTA3NTQ5MDJ9.mMS61QjvEuq1Abk7LKOR761v2WFvKDQr21c50S38qfs |  |

***Body:***
- `oldPassword`: String (required) - The old password.
- `newPassword`: String (required) - The new password.
  
**Success Response:**
- Status Code: 200 OK
```json
{
  "message": "Password updated successfully."
}
```

### 2. Forgetpassword request
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/password/forget-password-request
```
***Body:***
- `phone_number`: String (required) - The phone number associated with the user's account.
```js        
{
  "phone_number":"+254713518356"
}
```

**Success Response:**
- Status Code: 200 OK
```json
{
  "message": "Password reset token generated and sent successfully.",
  "userId": "user_id"
}
```


### 3 verifyPasswordResetToken
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/password/verify-token
```
***Body:***

```js        
{
   "reset_token":"8752",
   "user_id":"e3a818c6-2d3f-49b5-a716-a97b8fd4c009"
}
```
***Success Response:***
- Status Code: 200 OK
```json
{
  "securityQuestions": [
    {
      "id": "question_id",
      "question": "security_question"
    },
    {
      "id": "question_id",
      "question": "security_question"
    },
  ]
}
```

### 3. verifySecurityAnser
***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/password/verify-security-answers
```
***Body:***
- `user_id`: String (required) - The ID of the user.
- `answers`: Array (required) - Array of security question IDs and corresponding answers provided by the user.
  - `question_id`: String - The ID of the security question.
  - `answer`: String - The answer to the security question

```js        
{
  "answers": [
    {
      "question_id": "0d251871-9f84-491f-a4fa-5bb834674731",
      "answer": "Okothe"
    },
    {
      "question_id": "0f4bc545-122c-4733-80e7-bf67fa7b738d",
      "answer": "Lilac"
    },
    {
      "question_id": "29c1406f-ca4e-401f-aa59-2633ea67e652",
      "answer": "Di Ziyuan"
    }
  ],
  "user_id": "e3a818c6-2d3f-49b5-a716-a97b8fd4c009"
}

```
**Success Response:**
- Status Code: 200 OK
```json
{
  "message": "Security questions answered successfully. You can now reset your password."
}

```

***Error Response:***
- Status Code: 200 OK
```json
{
  "error": "Incorrect answers. Contact customer service for help."
}

```

### 4. resetPassword

***Endpoint:***

```bash
Method: POST
Type: RAW
URL: https://save-up-3w7t.onrender.com/password/reset
```

***Body:***
- `id`: String (required) - The ID of the user.
- `new_password`: String (required) - The new password for the user.

***Success Response:***
- Status Code: 200 OK
```json
{
  "message": "Password updated successfully. Login"
}
```

---
[Back to top](#answers)
[Back to top](#password)
[Back to top](#securityquestions)
[Back to top](#categories)
[Back to top](#expenses)
[Back to top](#contributions)
[Back to savings](#savings)
[Back to users](#users)

>Generated at 2024-03-11 12:32:40 by [docgen](https://github.com/thedevsaddam/docgen)
