import sqlite3

# Connect to SQLite database
conn = sqlite3.connect(':memory:')  # Using an in-memory database for this example
conn.row_factory = sqlite3.Row  # This will allow us to get rows as dictionaries
cursor = conn.cursor()

# Enable foreign key support
cursor.execute("PRAGMA foreign_keys = ON")

# Create tables
cursor.execute('''
    CREATE TABLE dataset (
        dataset_id INTEGER PRIMARY KEY,
        dataset_name TEXT NOT NULL
    )
''')

cursor.execute('''
    CREATE TABLE tags (
        tag_id INTEGER PRIMARY KEY,
        tag_name TEXT NOT NULL
    )
''')

cursor.execute('''
    CREATE TABLE dataset_tags (
        dataset_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (dataset_id, tag_id),
        FOREIGN KEY (dataset_id) REFERENCES dataset(dataset_id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
    )
''')

# Insert data into dataset
cursor.executemany('''
    INSERT INTO dataset (dataset_id, dataset_name) VALUES (?, ?)
''', [
    (1, 'Dataset A'),
    (2, 'Dataset B'),
    (3, 'Dataset C')
])

# Insert data into tags
cursor.executemany('''
    INSERT INTO tags (tag_id, tag_name) VALUES (?, ?)
''', [
    (1, 'Tag1'),
    (2, 'Tag2'),
    (3, 'Tag3')
])

# Insert data into dataset_tags
cursor.executemany('''
    INSERT INTO dataset_tags (dataset_id, tag_id) VALUES (?, ?)
''', [
    (1, 1),  # Dataset A has Tag1
    (1, 2),  # Dataset A has Tag2
    (2, 1),  # Dataset B has Tag1
    (3, 3)   # Dataset C has Tag3
])

# Commit changes
conn.commit()

# Query to fetch datasets with their tags
cursor.execute('''
    SELECT * FROM dataset
    where dataset_id = 1
''')

# Fetch and print the results as dictionaries
results = cursor.fetchone()
print(dict(results))

# Close the connection
conn.close()