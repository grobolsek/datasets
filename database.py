import sqlite3


def create_database() -> None:
    connection = sqlite3.connect('datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets(
            dataset_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            title TEXT,
            description TEXT,
            collection TEXT,
            reference TEXT,
            tags TEXT,
            version REAL,
            year INTEGER,
            instances INTEGER,
            missing INTEGER,
            variables INTEGER,
            source TEXT,
            url TEXT
        )
    """)

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_name TEXT NOT NULL UNIQUE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dataset_tags (
            dataset_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (dataset_id, tag_id),
            FOREIGN KEY (dataset_id) REFERENCES dataset(dataset_id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
        )
    ''')

    connection.commit()
    connection.close()


def drop_table() -> None:
    connection = sqlite3.connect('datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS datasets")
    cursor.execute("DROP TABLE IF EXISTS tags")
    cursor.execute("DROP TABLE IF EXISTS dataset_tags")
    connection.commit()
    connection.close()


drop_table()
create_database()
