import sqlite3
import time
import logging
from copy import deepcopy

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class Database:
    def __init__(self, dataset: dict):
        self.extended_datasets = dataset
        self.connection = sqlite3.connect('../data/datasets.sqlite')
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

    def exists_update(self, table: str, column: str, value):
        """
        Checks if a record exists, if not inserts it, if exists updates it.
        """
        if value is None:
            return
        try:
            self._execute_with_retry(f"SELECT * FROM {table} WHERE {column} = ?", (value,))
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
                self.exists_update('tags', 'tag', tag)
            self.exists_update('domains', 'domain', self.extended_datasets['domain'])
            self.exists_update('languages', 'language', self.extended_datasets['language'])

            if self.extended_datasets['references'] is not None and type(self.extended_datasets['references'] is list):
                self.extended_datasets['references'] = '\n'.join(self.extended_datasets['references'])

            columns = ', '.join(self._converted_names(self.extended_datasets))
            placeholders = ', '.join(['?'] * (len(self.extended_datasets) - 1))
            sql = f'INSERT INTO datasets ({columns}) VALUES ({placeholders})'

            insert_values = deepcopy(self.extended_datasets)
            del insert_values['tags']

            self._execute_with_retry(sql, tuple(insert_values.values()))

            for tag in self.extended_datasets['tags']:
                self._execute_with_retry("""
                    INSERT INTO datasets_tags(db_location, tag_id) 
                    VALUES (?, ?)
                """, (self.extended_datasets['location'], tag))

            self.connection.commit()
            self.close()
        except sqlite3.IntegrityError as e:
            self.close()
            logging.error(f"Integrity error during add operation: {e}")
            return e, 400

    def edit(self, changes: dict):
        if 'language' in changes:
            self.exists_update('languages', 'language', changes['language'])
        if 'domain' in changes:
            self.exists_update('domains', 'domain', changes['domain'])
        if 'tags' in changes:
            self._execute_with_retry('DELETE FROM datasets_tags WHERE db_location = ?',
                                     (self.extended_datasets['location'],))
            self.connection.commit()
            for tag in changes['tags']:
                self.exists_update('tags', 'tag', tag)
                self._execute_with_retry('INSERT INTO datasets_tags (db_location, tag_id) VALUES (?, ?)',
                                         (self.extended_datasets['location'], tag))

        removed_tags = deepcopy(changes)
        if 'tags' in changes:
            del removed_tags['tags']

        if 'references' in removed_tags and type(removed_tags['references'] is list):
            removed_tags['references'] = '\n'.join(removed_tags['references'])

        set_clause = ', '.join([f"db_{key} = ?" for key in removed_tags.keys()])
        values = list(removed_tags.values())
        if values:
            values.append(self.extended_datasets['location'])

            sql_query = f"UPDATE datasets SET {set_clause} WHERE db_location = ?"
            self._execute_with_retry(sql_query, tuple(values))

        self.connection.commit()
        self.close()

    def get_value(self):
        query = """
                SELECT d.*, GROUP_CONCAT(t.tag, ', ') as tags
                FROM datasets d
                LEFT JOIN datasets_tags dt ON d.db_location = dt.db_location
                LEFT JOIN tags t ON dt.tag_id = t.tag
                WHERE LOWER(d.db_location) = LOWER(?)
                GROUP BY d.db_location
                """
        self._execute_with_retry(query, (self.extended_datasets['location'],))
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
        query = f"""
                SELECT *, GROUP_CONCAT(t.tag, ', ') as db_tags
                FROM datasets d
                LEFT JOIN datasets_tags dt ON d.db_location = dt.db_location
                LEFT JOIN tags t ON dt.tag_id = t.tag
                GROUP BY d.db_location
                """
        self.cursor.execute(query)
        rows = self.cursor.fetchall()

        datasets_with_tags = []
        for row in rows:
            dataset = dict(row)
            tags = row['db_tags']
            if tags:
                dataset['db_tags'] = tags.split(', ')
            else:
                dataset['db_tags'] = []
            datasets_with_tags.append(dataset)

        return datasets_with_tags

    def close(self):
        self.cursor.close()
        self.connection.close()

    def check_exists(self):
        self._execute_with_retry(
            'SELECT * FROM datasets WHERE db_location = ?',
            (self.extended_datasets['location'],)
        )
        if self.cursor.fetchone() is not None:
            logging.warning(f'Dataset {self.extended_datasets['location']} already exists in database')
            return True
        return False

    def get_tables(self, table_name, column_name):
        self._execute_with_retry(f'SELECT {column_name} FROM {table_name}')
        values = self.cursor.fetchall()
        return [j for i in values for j in i]
