# Custom PostgreSQL Error Codes
These custom error codes are used within PostgreSQL functions to handle various exceptional conditions.

## P0001: Not Found Errors
Used for all "not found" errors when raising exceptions. Examples include:
- User not found
- Pocket not found

## P0002: Authorization Errors
Used for all authorization-related errors, particularly when a user lacks administrative privileges. Examples include:
- User is not an admin
- User is not a group admin

## P0003: Limit Exceeded Errors
Used for errors when a user has exceeded a defined limit. Examples include:
- User has reached the maximum limit of votes they can cast
- Maximum limit of security answers reached

## P0004: Insufficiency Errors
Used for errors related to insufficient resources or values. Examples include:
- Insufficient votes to meet election requirements
- Insufficient funds in the pocket

## P0005: Locked Errors
Used for errors when resources are locked or unavailable. Examples include:
- Funds in a pocket are locked
- Election is closed

## P0006: Conflict Errors
Used when a requested action conflicts with existing conditions. Examples include:
- Cannot delete a pocket because it contains funds
- Cannot remove a user from a group because they have deposited funds

## P0007: Ongoing Process Errors
Used when an action cannot proceed due to another ongoing process. Examples include:
- Cannot create a new election because there is an ongoing election
  
Except for this all other exceptions eg unique_violation, foreign constraints are
handled by psg predefined errcodes