import sqlite3


def create_database() -> None:
    connection = sqlite3.connect('../data/datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets(
            dataset_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT DEFAULT "",
            description TEXT DEFAULT "",
            collection TEXT DEFAULT "",
            reference_list TEXT DEFAULT "",
            version TEXT DEFAULT "",
            year INTEGER DEFAULT 0,
            instances INTEGER DEFAULT 0,
            missing INTEGER DEFAULT 0,
            variables INTEGER DEFAULT 0,
            source TEXT DEFAULT "",
            url TEXT DEFAULT "",
            domain TEXT DEFAULT "core",
            language TEXT DEFAULT "English",
            custom TEXT DEFAULT "",
            target TEXT DEFAULT "",
            location TEXT DEFAULT "",
            size INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets_tags (
            dataset_id TEXT,
            tag TEXT,
            PRIMARY KEY (dataset_id, tag),
            FOREIGN KEY (dataset_id) REFERENCES datasets(dataset_id) ON DELETE CASCADE
        )
    """)

    connection.commit()
    connection.close()


def drop_table() -> None:
    connection = sqlite3.connect('../data/datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS datasets")
    cursor.execute("DROP TABLE IF EXISTS datasets_tags")
    connection.commit()
    connection.close()


drop_table()
create_database()