
## Database Schema
You can check the database schema [here](./schema.md).

## Table of Contents
- [USERS](#users)
    - [POST /users](#post-users)
    - [POST /signin](#post-signin)
    - [POST /signout](#post-signout)
  - [UPDATE /users/{id}](#update-usersid)
  - [DELETE /users/{id}](#delete-usersid)
- [SAVINGS](#savings)
    - [POST /savings](#post-savings)
    - [GET /savings/user/:id](#get-savingsuserid)
    - [GET /savings/status/:status](#get-savingsstatusstatus)
    - [GET /savings/priority/:priority](#get-savingsprioritypriority)
    - [GET /savings/user/:id](#get-savingsuserid-1)
- [CONTRIBUTIONS](#contributions)
    - [POST /contributions](#post-contributions)
- [EXPENSE](#expense)
    - [POST /expenses](#post-expenses)
    - [GET /expenses/category/:category](#get-expensescategorycategory)


# USERS

### POST /users
 - **Description:** Creates a user.
- **Endpoint:** `https://save-up-3w7t.onrender.com/users/`
- **Method:** POST
- **REQUEST BODY:** 
    ``` json
      {
        "first_name": "John",
        "last_name": "Doe",
         "email": "johndoe@example.com",
          "password": "strongPassword123"
      }
    ```
- **SUCCESFUL RESPONSE:** 
   ``` json
  {
      "id": 7,
    "email": "johndoe@example.com",
    "phone_no": null,
    "password_hash": "$2b$10$ZYwb3WBIhqfAgkvfKAB3tuiTfgqnk9UF2r2iArXA.BsegXUdHDJky",
    "created_at": "2024-02-10T06:42:14.162Z",
    "updated_at": "2024-02-10T06:42:14.162Z",
    "first_name": "John",
    "last_name": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzA3NTQ3MzM0LCJleHAiOjE3MDc1NTA5MzR9.iYTHAt9MfI6Oa_NpL1tUdog6XzE5KeXI6L8f_GC1K1U"
  }
  ```
- **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```
### POST /signin
- **Description:** Sign in.
- **Endpoint:** `https://save-up-3w7t.onrender.com/users/signin`
- **Method:** POST
- **REQUEST BODY:** Accepts either email or phone_no, whatever the user prefers
    ``` json
      {
        "phone_no": "phone_no", || "email": "email",
        "password": "Writepassword@2000"
      }
    ```
- **SUCCESFUL RESPONSE:** user object with auth token
   ``` json
  
     {
      "id": 2,
      "username": "queenslayjema",
      "email": "queenslayjema@gmail.com",
      "phone_no": "0713518356",
      "password_hash": "$2b$10$0WbxmxmVtEmCZsyboiiHlOW2nzG1WSMaM0o/aC0hUYVQl07eYlpEW",
      "created_at": "2024-02-09T12:48:23.564Z",
      "updated_at": "2024-02-09T12:48:23.564Z",
      "token": "sample token here"
    },
  ```
  
- **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```



### POST /signout
- **Description:** Sign out
- **Endpoint:** `https://save-up-3w7t.onrender.com/users/signout`
- **Method:** POST
- **REQUEST BODY:** User and the auth token which is sent as a cookie
    Headers:
       Cookie: auth_token=actual token;
       Body: user
- **SUCCESFUL RESPONSE:** res 2004 NO BODY
- **FAILED RESPONSE:** res 2004 ok

 ``` json

 {"error":"sample error is shown here"}

  ```

## UPDATE /users/{id}
- **Method:** PATCH
- **REQUEST BODY:** User obj with new credentials
    ```
- **SUCCESFUL RESPONSE:** User obj with new cred
  ```
- **FAILED RESPONSE:** 
 ``` json
{"error": "Sample error message"}
  ```

## DELETE /users/{id}
- **Method:** PATCH
- **Endpoint:** `https://save-up-3w7t.onrender.com/users/{id}`
- **Response:** Status 204 ,no response


# SAVINGS

### POST /savings
 - **Description:** The user creates a new saving goal.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings`
- **Method:** POST
- **REQUEST BODY:** 
    ``` json
      {
        " user_id": "username",
        "description": "email",
        "category": "Sample category",
        "target_amount": "2000",
        "priority": "High",
        "target_date": "2024-02-09T12:48:23.564Z"
      }
    ```
- **SUCCESFUL RESPONSE:** status code 201
   ``` json
    {
        "id": 2,
        "user_id": 2,
        "description": "get insurance",
        "category": "Sample category",
        "targetamount": "2000.00",
        "contributedamount": "0", //automtically starts at 0 whe a user uploads ocntribution we upadet
        "priority": "High",
        "status": "In Progress",  //automatically set to in progreess, update sttaus to complete when user finishes
        "targetdate": "2024-02-09T00:00:00.000Z",
        "startdate": "2024-02-09T00:00:00.000Z",  //autommatically set to savings caretion date
        "created_at": "2024-02-09T13:35:20.280Z",
        "updated_at": "2024-02-09T13:35:20.280Z"
    }
  ```
- **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```

### GET /savings/user/:id

- **Description:** Retrieves all savings goals associated with a specific user.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/user/:id`
- **Method:** GET
- **Parameters:**
  - `:id` (integer, required): The unique identifier of the user whose savings goals to retrieve.
- **Successful Response:** Status code 200
  ```json
  [
    {
      "id": 1,
      "user_id": 2,
      "description": "Get insurance",
      "category": "Sample category",
      "target_amount": 2000,
      "contributed_amount": 0,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "description": "Get a new car",
      "category": "Sample category",
      "target_amount": 10000,
      "contributed_amount": 5000,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    }
  ]

- **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```

### GET /savings/status/:status
- **Description:** Retrieve savings goals by status.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/status/:status`
- **Method:** GET
- **Parameters:**
  - `:status` (string, required): The status of the savings goals to retrieve.
- **SUCCESSFUL RESPONSE:** status code 200
  ```json
  [
    {
      "id": 1,
      "user_id": 2,
      "description": "Get insurance",
      "category": "Sample category",
      "target_amount": 2000,
      "contributed_amount": 0,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "description": "Get a new car",
      "category": "Sample category",
      "target_amount": 10000,
      "contributed_amount": 5000,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    }
  ]

### GET /savings/category/:category
- **Description:** Retrieve savings goals by category.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/category/:category`
- **Method:** GET
- **Parameters:**
  - `:category` (string, required): The category of the savings goals to retrieve.
- **SUCCESSFUL RESPONSE:** status code 200.If none matches an empty array is sent
  ```json
  [
    {
      "id": 1,
      "user_id": 2,
      "description": "Get insurance",
      "category": "Sample category",
      "target_amount": 2000,
      "contributed_amount": 0,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    }
  ]
  - **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```

### GET /savings/priority/:priority
- **Description:** Retrieve savings goals by priority.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/priority/:priority`
- **Method:** GET
- **Parameters:**
  - `:priority` (string, required): The priority of the savings goals to retrieve.
- **SUCCESSFUL RESPONSE:** status code 200.If no entry matches an empty array is sent []
  ```json
  [
    {
      "id": 1,
      "user_id": 2,
      "description": "Get insurance",
      "category": "Sample category",
      "target_amount": 2000,
      "contributed_amount": 0,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    },
    {
      "id": 2,
      "user_id": 2,
      "description": "Get a new car",
      "category": "Sample category",
      "target_amount": 10000,
      "contributed_amount": 5000,
      "priority": "High",
      "status": "In Progress",
      "target_date": "2024-02-09T00:00:00.000Z",
      "start_date": "2024-02-09T00:00:00.000Z",
      "created_at": "2024-02-09T13:35:20.280Z",
      "updated_at": "2024-02-09T13:35:20.280Z"
    }
  ]
- **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```

### GET /savings/user/:id
- **Description:** Retrieves all savings goals associated with a specific user.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/user/:id`
- **Method:** GET
- **Parameters:**
  - `:id` (integer, required): The unique identifier of the user whose savings goals to retrieve.
- **Successful Response:** Status code 200
    ```json
    [
      {
        "id": 1,
        "user_id": 2,
        "description": "Get insurance",
        "category": "Sample category",
        "target_amount": 2000,
        "contributed_amount": 0,
        "priority": "High",
        "status": "In Progress",
        "target_date": "2024-02-09T00:00:00.000Z",
        "start_date": "2024-02-09T00:00:00.000Z",
        "created_at": "2024-02-09T13:35:20.280Z",
        "updated_at": "2024-02-09T13:35:20.280Z"
      },
      {
        "id": 2,
        "user_id": 2,
        "description": "Get a new car",
        "category": "Sample category",
        "target_amount": 10000,
        "contributed_amount": 5000,
        "priority": "High",
        "status": "In Progress",
        "target_date": "2024-02-09T00:00:00.000Z",
        "start_date": "2024-02-09T00:00:00.000Z",
        "created_at": "2024-02-09T13:35:20.280Z",
        "updated_at": "2024-02-09T13:35:20.280Z"
      }
    ]
   ```

- **FAILED RESPONSE:** 
 ``` json
{"error":"sample error is shown here"}
  ```


# CONTRIBUTIONS

### POST /contributions
 - **Description:** They represent individual contributions towards a saving.Users can contribute money to the goal till they reach target.A savings has many contributions.
- **Endpoint:** `https://save-up-3w7t.onrender.com/contributions`
- **Method:** POST saving_id, amount, date
- **REQUEST BODY:** 
    ``` json
      {
        "saving_id": "username",
        "amount": "2000",
        "date": "2024-02-09T12:48:23.564Z"
      }
    ```
- **SUCCESFUL RESPONSE:** status code 201
   ``` json
    {
    "id": 2,
    "saving_id": 2,
    "amount": "2000.00",
    "date": "2024-02-09T00:00:00.000Z",
    "created_at": "2024-02-09T13:42:23.011Z",
    "updated_at": "2024-02-09T13:42:23.011Z"
  }
  ```
# EXPENSE

### POST /expenses
- **Endpoint:** `https://save-up-3w7t.onrender.com/expenses`
- **Method:** POST saving_id, amount, date
- **REQUEST BODY:** 
    ``` json
      {
        "user_id": 1,
        "amount": "2000",
        "category":"category",
        "description":"find description",
        "date": "2024-02-09T12:48:23.564Z"
      }
    ```
- **SUCCESFUL RESPONSE:** status code 201
   ``` json
    {
    "id": 2,
    "saving_id": 2,
    "amount": "2000.00",
         "description":"find description",
    "date": "2024-02-09T00:00:00.000Z",
    "created_at": "2024-02-09T13:42:23.011Z",
    "updated_at": "2024-02-09T13:42:23.011Z"
  }
  ```

### GET /expenses/category/:category
- **Description:** Retrieve expenses by category.
- **Endpoint:** `https://save-up-3w7t.onrender.com/savings/category/:category`
- **Method:** GET
- **Parameters:**
  - `:category` (string, required): The category of the expense to retrieve.
- **SUCCESSFUL RESPONSE:** status code 200.If none matches an empty array is sent
  ```json
  [
      {
        "id": 1,
        "user_id": 1222,
        "category": "Groceries",
        "amount": "50.00",
             "description":"find description",
        "date": "2024-02-08T21:00:00.000Z",
        "created_at": "2024-02-09T05:56:42.049Z",
        "updated_at": "2024-02-09T05:56:42.049Z"
    },
  ]
  - **FAILED RESPONSE:** 
 ``` json
 {"error":"sample error is shown here"}
  ```


