# Save-up-backend Api doc
# USERS

### POST /users
 - **Description:** Creates a user.
- **Endpoint:** `https://save-up-3w7t.onrender.com/users/`
- **Method:** POST
- **REQUEST BODY:** 
    ``` json
      {
        "username": "username",
        "email": "email",
        "phone_no": "0713518356",
        "password": "Writepassword@2000"
      }
    ```
- **SUCCESFUL RESPONSE:** 
   ``` json
  {
    "user": {
      "id": 2,
      "username": "queenslayjema",
      "email": "queenslayjema@gmail.com",
      "phone_no": "0713518356",
      "password_hash": "$2b$10$0WbxmxmVtEmCZsyboiiHlOW2nzG1WSMaM0o/aC0hUYVQl07eYlpEW",
      "created_at": "2024-02-09T12:48:23.564Z",
      "updated_at": "2024-02-09T12:48:23.564Z"
    },
    "token": "sample token here"
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
- **REQUEST BODY:** Accepts either email or password, whatever the user sends
    ``` json
      {
        "username": "username", || "email": "email",
        "email": "email",
        "password": "Writepassword@2000"
      }
    ```
- **SUCCESFUL RESPONSE:** user object with auth token
   ``` json
  {
    "user": {
      "id": 2,
      "username": "queenslayjema",
      "email": "queenslayjema@gmail.com",
      "phone_no": "0713518356",
      "password_hash": "$2b$10$0WbxmxmVtEmCZsyboiiHlOW2nzG1WSMaM0o/aC0hUYVQl07eYlpEW",
      "created_at": "2024-02-09T12:48:23.564Z",
      "updated_at": "2024-02-09T12:48:23.564Z"
    },
    "token": "sample token here"
  }
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
    ```
- **SUCCESFUL RESPONSE:** res 2004 NO BODY
- - **FAILED RESPONSE:** res 2004 ok
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
