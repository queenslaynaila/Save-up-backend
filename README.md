
## Database Schema
You can check the database schema [here](./db_schema.dbml) and the table diagram [here](./schema.md).

## Table of Contents
- [Users API](#users-api)
    - [1. Create User](#1-create-user)
    - [2. User Login](#2-user-login)
    - [3. User Logout](#3-user-logout)
    - [4. Get All Users](#4-get-all-users)
    - [5. Get User by ID](#5-get-user-by-id)
    - [6. Update User](#6-update-user)
- [Password Reset API](#password-reset-api)
    - [1. Initiate Password Reset](#1-initiate-password-reset)
    - [2. Reset Password](#2-reset-password)
- [Savings API](#savings-api)
    - [1. Create Saving](#1-create-saving)
    - [2. Get All Savings](#2-get-all-savings)
    - [3. Update Saving](#3-update-saving)
    - [4. Delete Saving](#4-delete-saving)
    - [5. Get Savings](#5-get-savings)
    - [6. Get All Savings](#6-get-all-savings)
- [Contributions API](#contributions-api)
    - [1. Create Contribution](#1-create-contribution)
    - [2. Get All Contributions](#2-get-all-contributions)
    - [3. Get Contribution by ID](#3-get-contribution-by-id)
    - [4. Update Contribution](#4-update-contribution)
    - [5. Delete Contribution](#5-delete-contribution)
    - [6. Get Contributions by Saving](#6-get-contributions-by-saving)
- [Expense API](#expense-api)
    - [1. Create Expense](#1-create-expense)
    - [2. Get All Expenses](#2-get-all-expenses)
    - [3. Get Expense by ID](#3-get-expense-by-id)
    - [4. Update Expense](#4-update-expense)
    - [5. Delete Expense](#5-delete-expense)
    - [6. Get Expenses by Query](#6-get-expenses-by-query)
- [Categories API](#categories-api)
    - [1. Create Category](#1-create-category)
    - [1. Get Category By Userid](#1-get-category-by-userid)
    - [2. Update Category](#2-update-category)
    - [3. Get Categories](#3-get-categories)
    - [4. Delete Category](#4-delete-category)
    - [5. Get Categories by User\_id ID](#5-get-categories-by-user_id-id)


# Users API

### 1. Create User

- **Route**: `POST /user`
- **Description**: Creates a new user account.
- **Request Body**:
  - `first_name` (string, required): The first name of the user.
  - `last_name` (string, required): The last name of the user.
  - `phone_no` (string, required): The phone number of the user. Kenyan phone no +254 followed by 9 digits
  - `password` (string, required): The password for the user account.
- **Response**:
  - Status Code: `200 OK`
  - Body: The created user object 
  - Header: Token with name X-Auth-Token
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid or an account with the provided email or phone number already exists.
    - Body: 
      ```json
      {
        "error": "Invalid email, phone number, or password" or "An account with the provided email or phone number already exists"
      }
      ```
- **Sample request**:
    ```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "phone_no": "+254712345678",
  "password": "Kenya123"
}


### 2. User Login

- **Route**: `POST users/signin`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  - `phone_no` (string, required): The phone number of the user.
  - `password` (string, required): The password for the user account.
- **Response**:
  - Status Code: `200 OK`
  - Body: The authenticated user object  .
  - Header:  X-Auth-Token', token
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid or the provided credentials are incorrect.
    - Body: 
      ```json
      {
        "error": "Invalid phone number, or password " or "Invalid phone number or password combination"
      }
      ```

### 3. User Logout

- **Route**: `POST users/signout`
- **Description**: Logs out the authenticated user by clearing the authentication header.
- **Request Headers**:
  - `X-Auth-Token`: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: Message indicating successful logout.

### 4. Get All Users

- **Route**: `GET /` Accesible to only admins or moderators
- **Description**: Retrieves a list of all users.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of user objects.
- **Error Responses**:
  - Status Code: `404 Not Found`
    - Description: Returned when no users are found.
    - Body: 
      ```json
      {
        "error": "No users found"
      }
      ```

### 5. Get User by ID

- **Route**: `GET /:id`
- **Description**: Retrieves a user by their ID.
- **Request Parameters**:
  - `id` (string, required): The ID of the user to retrieve.
- **Response**:
  - Status Code: `200 OK`
  - Body: The user object with the specified ID.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the user ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid user data" or "User with submitted ID not found"
      }
      ```

### 6. Update User

- **Route**: `PATCH /:id`
- **Description**: Updates user information.
- **Request Headers**:
  - `Authorization`: Token for user authentication.
- **Request Parameters**:
  - `id` (string, required): The ID of the user to update.
- **Request Body**: Fields to be updated.CAN BE either first_name or last_name
- **Response**:
  - Status Code: `200 OK`
  - Body: The updated user object.includeing either first_name or last_name
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the user ID or request body is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid user ID" or "Invalid user data. Please provide valid values for all user fields."
      }
      ```
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to update the user information.
    - Body: 
      ```json
      {
        "error": "You are not authorized to update this user information"
      }
      ```



# Password Reset API

### 1. Initiate Password Reset

- **Route**: `POST /initiate-password`
- **Description**: Initiates the password reset process by generating a reset token and sending it to the user's phone number via SMS.
- **Request Body**:
  - `phoneNo` (string, required): The phone number of the user requesting password reset.
- **Response**:
  - Status Code: `200 OK`
  - Body:
    ```json
    {
      "message": "Reset token generated and sent successfully."
    }
    ```
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Body:
      ```json
      {
        "error": "User with provided phone number does not exist"
      }
      ```

### 2. Reset Password

- **Route**: `POST /reset-password`
- **Description**: Resets the password of the user using a valid reset token.
- **Request Body**:
  - `newPassword` (string, required): The new password for the user account.
  - `resetToken` (string, required): The reset token received by the user via SMS.
- **Response**:
  - Status Code: `200 OK`
  - Body:
    ```json
    {
      "message": "Password updated successfully. Login"
    }
    ```
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Body (Token Expired):
      ```json
      {
        "error": "The reset token has expired. Please generate a new one."
      }
      ```
    - Body (Invalid Token):
      ```json
      {
        "error": "Invalid reset token."
      }
      ```

# Savings API

### 1. Create Saving

- **Route**: `POST /`
- **Request Headers**:
  - `Authorization`: Token for user authentication.
- **Description**: Creates a new saving entry.
- **Request Body**:
  - `user_id` (string, required): The ID of the user associated with the saving.
  - `description` (string, required): Description of the saving.
  - `category_id` (uuid, required): Category id of the saving.
  - `target_amount` (number, required): Target amount of the saving.
  - `priority` (string, required): Priority level of the saving.
  - `target_date` (string, required): Target date for achieving the saving.
- **Response**:
  - Status Code: `201 Created`
  - Body: The created saving object.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid saving data"
      }
      ```

### 2. Get All Savings

- **Route**: `GET savings/all`
- **Description**: Retrieves all savings entries.Accesible yo only admin and moderators
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of all savings entries.
- **Error Responses**:
  - Status Code: `404 Not Found`
    - Description: Returned when no savings are found.
    - Body: 
      ```json
      {
        "error": "No savings found"
      }
      ```

### 3. Update Saving

- **Route**: `PATCH /:id`
- **Description**: Updates an existing saving entry.
- - **Request Headers**:
  - `Authorization`: Token for user authentication.
- **Request Parameters**:
  - `id` (string, required): The ID of the saving to update.
- **Request Body**: Fields to be updated.
- **Response**:
  - Status Code: `200 OK`
  - Body: The updated saving object. INCLUDEITING EITHER OF THE FOLLOWING   description:STRINF, target_amount:NUMBER, priority:STRING, target_date:STRING
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body or saving ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid saving data" or "Saving with given ID not found"
      }
      ```
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to update the saving.
    - Body: 
      ```json
      {
        "error": "You are not authorized to update this saving"
      }
      ```

### 4. Delete Saving

- **Route**: `DELETE /:id`
- **Description**: Deletes an existing saving entry.
- - **Request Headers**:
  - `Authorization`: Token for user authentication.
- **Request Parameters**:
  - `id` (string, required): The ID of the saving to delete.
- **Response**:
  - Status Code: `204 No Content`
    - Description: Returned when the saving is deleted successfully.
  - Status Code: `400 Bad Request`
    - Description: Returned when the saving with the provided ID is not found.
    - Body: 
      ```json
      {
        "error": "Saving with provided ID not found"
      }
      ```
- **Error Responses**:
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to delete the saving.
    - Body: 
      ```json
      {
        "error": "You are not authorized to update this saving"
      }
      ```

### 5. Get Savings

- **Route**: `GET /savings?user_id=sample&priority=high&you can add other queries`
- **Description**: Retrieves savings data based on the provided filters.
- **Query Parameters**:
  - `user_id` (string, required): The ID of the user whose savings are to be retrieved.
  - `priority` (string, optional): Filter savings by priority.
  - `status` (string, optional): Filter savings by status.
- **Request Headers**:
  - `Authorization`: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of savings objects matching the provided filters.
- **Error Responses**:
  - Status Code: `403 Forbidden`
    - Description: Returned when a user attempts to access savings data that does not belong to them.
    - Body: 
      ```json
      {
        "error": "Unauthorized access"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when no savings data is found for the provided query parameters.
    - Body: 
      ```json
      {
        "error": "No savings found with the provided filters"
      }
      ```
### 6. Get All Savings

- **Route**: `GET savings/all` Accesible to only admins or moderators
- **Description**: Retrieves a list of all users.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of user objects.
- **Error Responses**:
  - Status Code: `404 Not Found`
    - Description: Returned when no users are found.
    - Body: 
      ```json
      {
        "error": "No users found"
      }
      ```
# Contributions API

### 1. Create Contribution

- **Route**: `POST /`
- **Description**: Creates a new contribution.
- **Request Body**:
  - `saving_id` (string, required): The ID of the savings associated with the contribution.
  - `amount` (number, required): The amount of the contribution.
  - `date` (string, required): The date of the contribution.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `201 Created`
  - Body: The created contribution object.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid or the saving ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid saving id, amount, or date"
      }
      ```

### 2. Get All Contributions

- **Route**: `GET /contributions/all`
- **Description**: Retrieves a list of all contributions.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of contribution objects.
- **Error Responses**:
  - Status Code: `404 Not Found`
    - Description: Returned when no contributions are found.
    - Body: 
      ```json
      {
        "error": "No contributions found"
      }
      ```

### 3. Get Contribution by ID

- **Route**: `GET /:id`
- **Description**: Retrieves a contribution by its ID.
- **Request Parameters**:
  - `id` (string, required): The ID of the contribution to retrieve.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: The contribution object with the specified ID.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the contribution ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid contributions ID"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when the contribution with the provided ID is not found.
    - Body: 
      ```json
      {
        "error": "Contribution with provided ID not found"
      }
      ```

### 4. Update Contribution

- **Route**: `PATCH /:id`
- **Description**: Updates a contribution.
- **Request Parameters**:
  - `id` (string, required): The ID of the contribution to update.
- **Request Body**: Fields to be updated.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: The updated contribution object.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the contribution ID or request body is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid contributions data. Please provide valid values for all user fields."
      }
      ```
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to update the contribution.
    - Body: 
      ```json
      {
        "error": "Unauthorized to update contribution for this user"
      }
      ```

### 5. Delete Contribution

- **Route**: `DELETE /:id`
- **Description**: Deletes a contribution.
- **Request Parameters**:
  - `id` (string, required): The ID of the contribution to delete.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `204 No Content`
    - Description: Returned when the contribution is deleted successfully.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the contribution ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid user ID"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when the contribution with the provided ID is not found.
    - Body: 
      ```json
      {
        "error": "Contribution with given ID not found"
      }
      ```

### 6. Get Contributions by Saving

- **Route**: `GET /savings?saving_id=samplesavingid & optional queries`
- **Description**: Retrieves contributions associated with a specific savings.
- **Request Parameters**:
  - `id` (string, required): The ID of the savings.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of contribution objects.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the saving ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid saving ID"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when no contributions are found for the specified saving ID.
    - Body: 
      ```json
      {
        "error": "Contribution with given savingID not found"
      }
      ```

# Expense API

### 1. Create Expense

- **Route**: `POST /expenses`
- **Description**: Creates a new expense.
- **Request Body**:
  - `description` (string, required): Description of the expense.
  - `category_id` (string,uuid, required): Category of the expense.
  - `amount` (number, required): Amount of the expense.
  - `date` (string, required): Date of the expense.
  - `user_id` (string, required): ID of the user associated with the expense.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `201 Created`
  - Body: The created expense object.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid expense data provided"
      }
      ```

### 2. Get All Expenses

- **Route**: `GET /expenses/all`
- **Description**: Retrieves a list of all expenses.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of expense objects.
- **Error Responses**:
  - Status Code: `404 Not Found`
    - Description: Returned when no expenses are found.
    - Body: 
      ```json
      {
        "error": "No expenses found"
      }
      ```

### 3. Get Expense by ID

- **Route**: `GET expense/:id`
- **Description**: Retrieves an expense by its ID.
- **Request Parameters**:
  - `id` (string, required): The ID of the expense to retrieve.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: The expense object with the specified ID.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the expense ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid expense ID"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when the expense with the provided ID is not found.
    - Body: 
      ```json
      {
        "error": "Expense with submitted ID not found"
      }
      ```

### 4. Update Expense

- **Route**: `PATCH expense/:id`
- **Description**: Updates an expense.
- **Request Parameters**:
  - `id` (string, required): The ID of the expense to update.
- **Request Body**: Fields to be updated siethr  description:string, category_id:stringuuid, amount:number
- **Response**:
  - Status Code: `200 OK`
  - Body: The updated expense object.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the expense ID or request body is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid data"
      }
      ```
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to update the expense.
    - Body: 
      ```json
      {
        "error": "You are not authorized to update this expense"
      }
      ```

### 5. Delete Expense

- **Route**: `DELETE /:id`
- **Description**: Deletes an expense.
- **Request Parameters**:
  - `id` (string, required): The ID of the expense to delete.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `204 No Content`
    - Description: Returned when the expense is deleted successfully.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the expense ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid expense ID"
      }
      ```
  - Status Code: `403 Forbidden`
    - Description: Returned when the user is not authorized to delete the expense.
    - Body: 
      ```json
      {
        "error": "You are not authorized to delete this expense"
      }
      ```

### 6. Get Expenses by Query

- **Route**: `GET /expenses?user_id=sanpleuserid & optional parameters `
- **Description**: Retrieves expenses based on query parameters.
- **Query Parameters** (optional):
  - `user_id` (string): ID of the user associated with the expenses.
  - `category_id` (string): Category of the expenses.
  - `month` (number): Month of the expenses.
- **Authorization Header**: Token for user authentication.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of expense objects.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the query parameters are invalid.
    - Body: 
      ```json
      {
        "error": "Invalid query parameters"
      }
      ```
  - Status Code: `404 Not Found`
    - Description: Returned when no expenses match the query parameters.
    - Body: 
      ```json
      {
        "error": "No savings found for the provided user ID/category/date"
      }
      ```

# Categories API

### 1. Create Category

- **Route**: `POST /categories`
- **Description**: Creates a new category.
- **Request Body**:
  - `user_id` (string,uuid, required): The UUID of the user creating the category.
  - `name` (string, required): The name of the category.
  - `description` (string, optional): The description of the category.
- **Response**:
  - Status Code: `200 OK`
  - Body: The created category object
  - Header: Token with name X-Auth-Token
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid.
    - Body:
      ```json
      {
        "error": "Invalid category data"
      }
      ```
  - Status Code: `500 Internal Server Error`
    - Description: Returned when there's a server-side error.
- **Sample request**:
    ```json
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Food",
      "description": "All food related expenses"
    }
    ```
  ### 1. Get Category By Userid

- **Route**: `POST /categories?user_id=sampleuserid`
- **Description**: It will bring all categories belonging to logged in user and also bring the systemdefined categories the default ones.
- **Request Body**:
  - `user_id` (string,uuid, required): The UUID of the user creating the category.
- **Response**:
  - Status Code: `200 OK`
  - Body: array of categories or []
  - Header: Token with name X-Auth-Token


### 2. Update Category

- **Route**: `PATCH /categories/:id`
- **Description**: Updates an existing category.
- **Request Parameters**:
  - `id` (string, required): The UUID of the category to update.
- **Request Body**:
  - `name` (string, optional): The new name of the category.
  - `description` (string, optional): The new description of the category.
- **Authorization**:
  - Required Role: User
- **Response**:
  - Status Code: `200 OK`
  - Body: The updated category object
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the request body is invalid.
  - Status Code: `404 Not Found`
    - Description: Returned when the category with the provided ID is not found.
- **Sample request**:
    ```json
    {
      "name": "New Food Category",
      "description": "Updated description for food category"
    }
    ```


### 3. Get Categories

- **Route**: `GET /categories/all`
- **Description**: Fetches categories from the database.
- **Authorization**:
  - Required Role: Admin or Moderator
- **Response**:
  - Status Code: `200 OK`
  - Content-Type: application/json
  - Body: An array of category objects
- **Error Responses**:
  - Status Code: `500 Internal Server Error`
    - Description: If there's a server-side error.


### 4. Delete Category

- **Route**: `DELETE /categories/:id`
- **Description**: Deletes a category.
- **Authorization**:
  - Required Role: User
- **Request Parameters**:
  - `id` (string, required): The ID of the category to delete.
- **Response**:
  - Status Code: `200 OK`
  - Content-Type: application/json
  - Body: 
    ```json
    {
      "message": "Category deleted successfully"
    }
    ```
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: If the provided category ID is invalid.
  - Status Code: `404 Not Found`
    - Description: If the category with the provided ID is not found.

### 5. Get Categories by User_id ID

- **Route**: `GET /categories?user_id=sampleid`
- **Description**: Retrieves categories filtered by user ID.
- **Request Parameters**:
  - `user_id` (string, required): The ID of the user to filter categories by.
- **Response**:
  - Status Code: `200 OK`
  - Body: An array of category objects filtered by the specified user ID.
- **Error Responses**:
  - Status Code: `400 Bad Request`
    - Description: Returned when the user ID is invalid.
    - Body: 
      ```json
      {
        "error": "Invalid user data" or "User with submitted ID not found"
      }
      ```
