# SaveUP API Documentation

## Group Management

### Basic Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/saveup/groups` | Create a new group |
| `PATCH` | `/saveup/groups/{group_id}` | Update group details |
| `GET` | `/saveup/groups/{user_id}` | Retrieve user's groups |

### Membership & Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/saveup/groups/{group_id}/members` | List group members |
| `DELETE` | `/saveup/groups/{group_id}/members/{member_id}` | Remove member from group |
| `POST` | `/saveup/groups/{group_id}/invitations` | Send invitation via phone |
| `GET` | `/saveup/groups/{group_id}/activities` | Get group activity log |

### Elections

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/saveup/groups/{group_id}/elections` | Create new election |
| `GET` | `/saveup/groups/{group_id}/elections` | List group elections |
| `PUT` | `/saveup/groups/{group_id}/elections/{election_id}` | Update election |

#### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/saveup/groups/{group_id}/elections/{election_id}/candidates` | Nominate candidates |
| `GET` | `/saveup/groups/{group_id}/elections/{election_id}/candidates` | List candidates |

#### Voting & Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/saveup/groups/{group_id}/elections/{election_id}/ballots` | Cast vote |
| `GET` | `/saveup/groups/{group_id}/elections/{election_id}/results` | View results |
| `POST` | `/saveup/groups/{group_id}/elections/{election_id}/confirm-results` | Ratify results |

## Notes

- For member removal:
  - Use `me` as `member_id` for self-removal
  - Provide actual member ID for admin removal (requires admin privileges)
- All endpoints require authentication
- Election operations check for correct status and permissions