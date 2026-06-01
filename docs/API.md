# API Reference

This document details the RESTful API endpoints, authentication requirements, and request/response formats.

## Authentication

The API uses two authentication patterns:

| Pattern | Endpoints | Header |
|---------|-----------|--------|
| **None** | `/register`, `/login`, `/subjects/*` | Not required |
| **Bearer Token** | `/profile`, `/materials/*`, `/messages/*` | `Authorization: Bearer {{jwt_token}}` |

</br>

---

## Endpoints

### Auth & Profile

| # | Method | Endpoint | Request Body | Auth |
|---|--------|----------|--------------|------|
| 1 | POST | `/register` | `{ "name", "email", "password" }` | None |
| 2 | POST | `/login` | `{ "email", "password" }`  | None |
| 3 | GET | `/profile` | — | Bearer |
| 4 | PUT | `/profile` | `{ "preferredSubject": "<id>" }` | Bearer |
| 5 | DELETE | `/profile` | — | Bearer |

### Subjects

| # | Method | Endpoint | Request Body | Auth |
|---|--------|----------|--------------|------|
| 6 | GET | `/subjects/` | — | None |
| 7 | POST | `/subjects/` | `{ "name", "description" }` | None |
| 8 | GET | `/subjects/:id` | — | None |
| 9 | PUT | `/subjects/:id` | `{ "name", "description" }` |  None |
| 10 | DELETE | `/subjects/:id` | — | None |

>  **Security Note:** `/subjects` endpoints lack backend authentication to facilitate development. The frontend's access to this endpoint is limited to fetch requests only.

### Materials

| # | Method | Endpoint | Request Body | Auth |
|---|--------|----------|--------------|------|
| 11 | GET | `/materials/` | — | Bearer |
| 12 | POST | `/materials/` | `{ "subject": "<id>", "topic", "content" }` | Bearer |
| 13 | GET | `/materials/:id` | —  | Bearer |
| 14 | PUT | `/materials/:id` | `{ "subject": "<id>", "topic", "content" }` | Bearer |
| 15 | DELETE | `/materials/:id` | — | Bearer |

### Messages

| # | Method | Endpoint | Request Body | Auth |
|---|--------|----------|--------------|------|
| 16 | GET | `/messages/` | — | Bearer |
| 17 | POST | `/messages/` | `{ "text", "isUser": true/false }` | Bearer |

</br>

---

## Postman Collection

Test the API using our official Postman collection.

### Quick Start
1. **Import Collection:** Download and import the [official collection](https://drive.google.com/drive/folders/1TH-Jpycz6pvIeUCc8KHME3SNfxrFGUEI?usp=drive_link) into [Postman](https://www.postman.com/).
2. **Set Variables:** Update the `base_url` variable in the collection settings.
    ```
    variable: base_url 
    value: http://localhost:3000/api/
    ```
4. **Login First:** Execute the `Login` request to obtain your JWT token. The test script automatically saves the token for subsequent requests.
5. **Run the Collection:** Click the `Run` button on the collection to execute all requests sequentially. This provides a quick overview of the API's status and validates all the test cases in one go.
