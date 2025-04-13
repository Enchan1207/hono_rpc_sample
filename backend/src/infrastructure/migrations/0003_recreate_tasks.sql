-- Migration number: 0003 	 2025-04-02T13:46:09.566Z

-- tasksテーブルにuser_idカラムを追加したいが、SQLiteは作成済みテーブルへの制約追加ができない。
-- 所詮サンプルプロジェクトなので、ここでは潔くDROPする

DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    due NUMBER NOT NULL,
    priority INTEGER NOT NULL,
    description TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
