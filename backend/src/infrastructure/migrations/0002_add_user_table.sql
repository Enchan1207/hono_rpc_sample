-- Migration number: 0002 	 2025-03-31T02:20:52.884Z
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    auth0_user_id TEXT NOT NULL
);
