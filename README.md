## Getting Started
This guide will assist you in setting up and exploring the SaveUp Backend API. 
SaveUp is a mobile application designed to empower users to save money effectively and efficiently. 
This backend API serves as the foundation for the SaveUp app, enabling users to save, track expenses, and withdraw their savings.

To understand the custom error codes used in our PostgreSQL functions & procedures, refer to the 
[Custom PostgreSQL Error Codes Documentation](./error-codes.md) for detailed descriptions and usage examples.

## Technology Stack

- **Backend:** Express with TypeScript for type safety.
- **Database:** PostgreSQL with Citus extension for distributed database functionality.
- **Authentication:** JSON Web Tokens (JWT) for secure user authentication.
- **Password Hashing:** Bcrypt for secure password hashing.
- **Scheduled Tasks:** Node-Cron for running cron jobs.
- **Rate Limiting:** Express-Rate-Limiter for creating limits per requests.

## Running the API

### Generate API Documentation

#### Fo Linux Users

Execute the following to generate the API documentation:

```bash
npm run swagger
```
This creates an OpenAPI (Swagger) specification file called swagger.yml in each route subfolder. 
The specification details the API's endpoints, requests, responses, and error formats along with samples.

#### For Windows Users
Use the following command to generate the Swagger specification for Windows:

```bash
npm run swaggerwindows
```

### Access API Documentation
Once the server starts, navigate to [http://localhost:3001/api-docs](http://localhost:3001/api-docs) in  
web browser to access the interactive API documentation. 
The documentation provides an overview of available API endpoints, including:

- **Routes:** URLs for accessing different functionalities.
- **Request Types:** Expected data formats for requests to the API.
- **Response Types:** Structures of data returned by the API in response to requests.
- **Error Response Types:** Structures of error returned by the API in response to requests.