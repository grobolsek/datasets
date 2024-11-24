import sqlite3
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class Database:
    def __init__(self):
        self.connection = sqlite3.connect('../data/datasets.sqlite')
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON")

    def __del__(self):
        self.cursor.close()
        self.connection.close()

    def execute_with_retry(self, query, params=(), retries=5, delay=1):
        """
        Executes a query with retry logic for handling database locks.
        """
        for attempt in range(retries):
            try:
                self.cursor.execute(query, params)
                self.connection.commit()
                return
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e) and attempt < retries - 1:
                    logging.warning(f"Database is locked, retrying in {delay} seconds...")
                    time.sleep(delay)
                    delay *= 2  # Exponential backoff
                else:
                    logging.error(f"Failed to execute query: {query} with params: {params}")
                    raise

    def fetchall(self, query, params=(), retries=5, delay=1):
        self.execute_with_retry(query, params, retries, delay)
        return self.cursor.fetchall()

    def fetchone(self, query, params=(), retries=5, delay=1):
        self.execute_with_retry(query, params, retries, delay)
        return self.cursor.fetchone()

    def fetchsingle(self, query, params=(), retries=5, delay=1):
        res = self.fetchone(query, params, retries, delay)
        return res and res[0]
