# Permissions for CRUD Operations on Application Resources

## Table of Contents
- [Users Resource](#users-resource)
- [Categories Resource](#categories-resource)
- [Security Questions](#security-questions)
- [Security Answers](#security-answers)
- [Savings Resource](#savings-resource)
- [Contributions Resource](#contributions-resource)
- [Expenses Resource](#expenses-resource)

---

## Users Resource

### Create User

- **Required Role**: ALL

### Read ALL Users
- **Required Role**: ADMIN, MODERATOR
- **Description**: Allows administrators and moderators to view a list of all users.
  
### Read User By UserID
- **Required Role**: ALL LOGGED IN USERS
- **Description**: Allows USER to view a USER by userid.

### Update User
- **Required Role**: ALL
- **Description**: Allows to update an existing user's information.

### Update User Phone NUmber
- **Required Role**: ALL
- **Description**: Allows a user to update phone no.

---

## Categories Resource

### Create Category

- **Required Role**: ALL

### Read ALL Categories
- **Required Role**: ADMIN, MODERATOR
- **Description**: Allows administrators and moderators to all system defined categories.
  
### Read Categories By UserID
- **Required Role**: ALL LOGGED IN USERS
- **Description**: Allows USER to view category belonging to him or her

### Update Category
- **Required Role**: ALL
- **Description**: Allows to update an existing categories
  
### DELETE CATEGORY
- **Required Role**: ALL
- **Description**: Allows a user to delete category.

---

## Security Questions

### Read ALL SEcurity questions 
- **Required Role**: ALL LOGGED IN USERS
- **Description**: Allows users to view a list of all System defined security questions.

---

## Security Answers

### Create Security Answer
- **Required Role**: ALL
- **Description**: Allows all users to create a new saving.

### Read Savings
- **Required Role**: ADMIN, MODERATOR, USER
- **Description**: Allows all users to view a list of all savings.

### Update Saving
- **Required Role**: ADMIN, MODERATOR, USER
- **Description**: Allows all users to update an existing saving's information.

### Delete SECURITY Answer
- **Required Role**: ALL
- **Description**: Allows a user to delete his security answer

### UPDATE SECURITY Answer
- **Required Role**: ALL
- **Description**: Allows a user to UPDATE his security answer


---

## Savings Resource

### Create Saving
- **Required Role**: ALL
- **Description**: Allows all users to create a new saving.

### Read ALL Savings
- **Required Role**: ADMIN, MODERATOR
- **Description**: Allows all users to view a list of all savings.

### Update Saving
- **Required Role**: ALL
- **Description**: Allows all users to update their existing saving's information.

### Delete Saving
- **Required Role**: All
- **Description**: Allows all users to delete their existing saving from the system.

### GET SAVING BY USER ID
- **Required Role**: All
- **Description**: Allows  users ACCESS to all their savings.


### GET SAVING BY saving ID
- **Required Role**: All
- **Description**: Allows  access to a saving by its id.


---
## Contributions Resource

### Create Contribution
- **Required Role**: ALL
- **Description**: Allows all users to create a new contribution.

### Read ALL Contributions
- **Required Role**: ADMIN, MODERATOR
- **Description**: Allows a list to all posted contributions.


### GET CONTRIBUTIONS BY  ID
- **Required Role**: All
- **Description**: Allows  users ACCESS to A CONTRIBUTION By its id.


### GET CONTRIBUTIONS BY saving ID
- **Required Role**: All
- **Description**: Allows  access to Contributions belonging to a particular saving id.


---
## Expenses Resource

### Create Expense
- **Required Role**: ALL
- **Description**: Allows all users to create a new expense.

### Read ALL Expenses
- **Required Role**: ADMIN, MODERATOR
- **Description**: Allows them to view a list of all savings.

### Update Expenses
- **Required Role**: ALL
- **Description**: Allows all users to update their existing expense information.

### Delete Expenses
- **Required Role**: All
- **Description**: Allows all users to delete their existing expenses from the system.

### GET Expense BY Expenses ID
- **Required Role**: All
- **Description**: Allows  users ACCESS to an expense via its id.


### GET Expenses BY userid
- **Required Role**: All
- **Description**: Allows  access to all expenses belonging to a specific user.
