-- Migration number: 0001 	 2025-03-30T08:28:36.400Z
CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    due NUMBER NOT NULL,
    priority INTEGER NOT NULL,
    description TEXT NOT NULL
);
