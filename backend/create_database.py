import sqlite3


def create_database() -> None:
    connection = sqlite3.connect('../data/datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
            CREATE TABLE IF NOT EXISTS domains (
                domain TEXT PRIMARY KEY UNIQUE
            )
        """)

    cursor.execute("""
            CREATE TABLE IF NOT EXISTS languages(
                language TEXT PRIMARY KEY UNIQUE
            )
        """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets(
            db_name TEXT,
            db_title TEXT,
            db_description TEXT,
            db_collection TEXT,
            db_references TEXT,
            db_version TEXT,
            db_year INTEGER,
            db_instances INTEGER,
            db_missing INTEGER,
            db_variables INTEGER,
            db_source TEXT,
            db_url TEXT,
            db_domain TEXT,
            db_language TEXT,
            db_custom TEXT,
            db_target TEXT,
            db_location TEXT,
            db_size INTEGER,
            PRIMARY KEY (db_location),
            FOREIGN KEY(db_language) REFERENCES languages(language),
            FOREIGN KEY (db_domain) REFERENCES domains(domain)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            tag TEXT PRIMARY KEY UNIQUE 
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasets_tags (
            db_location TEXT,
            tag_id TEXT,
            PRIMARY KEY (db_location, tag_id),
            FOREIGN KEY (db_location) REFERENCES datasets(db_location) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(tag) ON DELETE CASCADE
        )
    """)

    connection.commit()
    connection.close()


def drop_table() -> None:
    connection = sqlite3.connect('../data/datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute("DROP TABLE IF EXISTS datasets")
    cursor.execute("DROP TABLE IF EXISTS tags")
    cursor.execute("DROP TABLE IF EXISTS datasets_tags")
    cursor.execute("DROP TABLE IF EXISTS languages")
    cursor.execute("DROP TABLE IF EXISTS domains")
    connection.commit()
    connection.close()


drop_table()
create_database()