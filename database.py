import sqlite3
import time
import logging
from copy import deepcopy

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class Database:
    def __init__(self, dataset: dict):
        self.extended_datasets = dataset
        self.connection = sqlite3.connect('datasets.sqlite')
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON")

    def _execute_with_retry(self, query, params=(), retries=5, delay=1):
        """
        Executes a query with retry logic for handling database locks.
        """
        for attempt in range(retries):
            try:
                self.cursor.execute(query, params)
                return
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e) and attempt < retries - 1:
                    logging.warning(f"Database is locked, retrying in {delay} seconds...")
                    time.sleep(delay)
                    delay *= 2  # Exponential backoff
                else:
                    logging.error(f"Failed to execute query: {query} with params: {params}")
                    raise

    def exist_add(self, table: str, column: str, value):
        """
        Checks if a record exists, else adds it to the table.
        """
        try:
            self._execute_with_retry(f"SELECT 1 FROM {table} WHERE {column} = ?", (value,))
            if not self.cursor.fetchone():
                self._execute_with_retry(f"INSERT INTO {table} ({column}) VALUES (?)", (value,))
            self.connection.commit()
        except sqlite3.IntegrityError:
            logging.error(f"Error: {value} already exists in table {table}")

    def exists_update(self, table: str, column: str, value):
        """
        Checks if a record exists, if not inserts it, if exists updates it.
        """
        try:
            self._execute_with_retry(f"SELECT 1 FROM {table} WHERE {column} = ?", (value,))
            existing_record = self.cursor.fetchone()

            if existing_record:
                self._execute_with_retry(f"UPDATE {table} SET {column} = ? WHERE {column} = ?", (value, value))
            else:
                self._execute_with_retry(f"INSERT INTO {table} ({column}) VALUES (?)", (value,))
            self.connection.commit()
        except sqlite3.IntegrityError:
            logging.error(f"Error: {value} already exists in table {table}")

    @staticmethod
    def _converted_names(values) -> list[str]:
        return ['db_' + name for name in values.keys() if name != 'tags']

    def add(self):
        try:
            for tag in self.extended_datasets['tags']:
                self.exist_add('tags', 'tag', tag)
            self.exist_add('domains', 'domain', self.extended_datasets['domain'])
            self.exist_add('languages', 'language', self.extended_datasets['language'])

            if self.extended_datasets['references'] is not None:
                self.extended_datasets['references'] = '\n'.join(self.extended_datasets['references'])

            columns = ', '.join(self._converted_names(self.extended_datasets))
            placeholders = ', '.join(['?'] * (len(self.extended_datasets) - 1))
            sql = f'INSERT INTO datasets ({columns}) VALUES ({placeholders})'

            insert_values = deepcopy(self.extended_datasets)
            del insert_values['tags']

            self._execute_with_retry(sql, tuple(insert_values.values()))

            for tag in self.extended_datasets['tags']:
                self._execute_with_retry("""
                    INSERT INTO datasets_tags(db_name, tag_id) 
                    VALUES (?, ?)
                """, (self.extended_datasets['name'], tag))

            self.connection.commit()
            self.close()
        except sqlite3.IntegrityError as e:
            self.close()
            logging.error(f"Integrity error during add operation: {e}")
            return e, 400

    def edit(self, changes: dict):
        if 'db_language' in changes:
            self.exists_update('languages', 'language', changes['db_language'])
        if 'db_domain' in changes:
            self.exists_update('domains', 'domain', changes['db_domain'])
        if 'db_tags' in changes:
            for tag in changes['db_tags']:
                self.exists_update('tags', 'tag', tag)
                self._execute_with_retry(
                    'UPDATE datasets_tags SET tag_id = ? WHERE db_name = ? AND tag_id = ?',
                    (tag, self.extended_datasets['name'], tag)
                )

        set_clause = ', '.join([f"{col} = ?" for col in changes.keys()])
        values = list(changes.values())
        values.append(self.extended_datasets['name'])

        sql_query = f"UPDATE datasets SET {set_clause} WHERE db_name = ?"
        self._execute_with_retry(sql_query, tuple(values))

        if changes.get('db_name') is not None:
            self._execute_with_retry('''
                UPDATE datasets SET db_name = ? 
                WHERE db_name = ? ''', (changes['db_name'], self.extended_datasets['name']))
            self.connection.commit()
            self._execute_with_retry('''
                UPDATE datasets_tags SET db_name = ?
                WHERE db_name = ?
            ''', (changes['db_name'], self.extended_datasets['name']))

        self.connection.commit()
        self.close()

    def get_value(self):
        query = """
                SELECT d.*, GROUP_CONCAT(t.tag, ', ') as tags
                FROM datasets d
                LEFT JOIN datasets_tags dt ON d.db_name = dt.db_name
                LEFT JOIN tags t ON dt.tag_id = t.tag
                WHERE d.db_name = ?
                GROUP BY d.db_name
                """
        self._execute_with_retry(query, (self.extended_datasets['name'],))
        row = self.cursor.fetchone()

        if row:
            dataset = dict(row)
            tags = row['tags']
            if tags:
                dataset['tags'] = tags.split(', ')
            else:
                dataset['tags'] = []
            return dataset
        else:
            return None

    def get_all(self):
        query = """
                SELECT d.*, GROUP_CONCAT(t.tag, ', ') as tags
                FROM datasets d
                LEFT JOIN datasets_tags dt ON d.db_name = dt.db_name
                LEFT JOIN tags t ON dt.tag_id = t.tag
                GROUP BY d.db_name
                """
        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        datasets_with_tags = []
        for row in rows:
            dataset = dict(row)
            tags = row['tags']
            if tags:
                dataset['tags'] = tags.split(', ')
            else:
                dataset['tags'] = []
            datasets_with_tags.append(dataset)

        return datasets_with_tags

    def close(self):
        self.cursor.close()
        self.connection.close()

    def check_exists(self):
        self._execute_with_retry(
            'SELECT * FROM datasets WHERE db_name = ?',
            (self.extended_datasets['name'],)
        )
        if self.cursor.fetchone() is not None:
            logging.warning(f'Dataset {self.extended_datasets['name']} already exists in database')
            return True
        return False
