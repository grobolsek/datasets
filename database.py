import sqlite3


def create_database() -> None:
    connection = sqlite3.connect('datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
            CREATE TABLE IF NOT EXISTS domains (
                domain_name TEXT PRIMARY KEY NOT NULL UNIQUE
            )
        """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets(
            dataset_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            title TEXT,
            description TEXT,
            collection TEXT,
            reference TEXT,
            version REAL,
            year INTEGER,
            instances INTEGER,
            missing INTEGER,
            variables INTEGER,
            source TEXT,
            url TEXT,
            custom TEXT,
            domain_name TEXT,
            FOREIGN KEY (domain_name) REFERENCES domains(domain_name)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS languages(
            language_id INTEGER PRIMARY KEY AUTOINCREMENT,
            language_name TEXT UNIQUE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            tag_name TEXT NOT NULL UNIQUE
        )
    """)

    cursor.execute("""
            CREATE TABLE IF NOT EXISTS languages_datasets(
                language_id INTEGER,
                dataset_id INTEGER,
                PRIMARY KEY (language_id, dataset_id),
                FOREIGN KEY (dataset_id) REFERENCES datasets(dataset_id)
                FOREIGN KEY (language_id) REFERENCES languages(language_id)
            )
        """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets_tags (
            dataset_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (dataset_id, tag_id),
            FOREIGN KEY (dataset_id) REFERENCES dataset(dataset_id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
        )
    """)

    connection.commit()
    connection.close()


def drop_table() -> None:
    connection = sqlite3.connect('datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS datasets")
    cursor.execute("DROP TABLE IF EXISTS tags")
    cursor.execute("DROP TABLE IF EXISTS dataset_tags")
    cursor.execute("DROP TABLE IF EXISTS languages")
    cursor.execute("DROP TABLE IF EXISTS domains")
    cursor.execute("DROP TABLE IF EXISTS languages_datasets")
    connection.commit()
    connection.close()


drop_table()
create_database()
