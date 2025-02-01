DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    due NUMBER NOT NULL,
    priority TEXT NOT NULL,
    description TEXT NOT NULL
);
