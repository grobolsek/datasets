import sqlite3
import Orange

class Dataset:
    def __init__(self, name: str = None, title: str = None, description: str = None, collection: str = None,
                 references: str = None, tags: list[str] = None, version: float = None, year: int = None,
                 source: str = None):

        self.dataset = {
            'name': name,
            'title': title,
            'description': description,
            'collection': collection,
            'references': references,
            'tags': tags,
            'version': version,
            'year': year,
            'source': source,
        }

    def get_from_database(self, name):
        try:
            connection = sqlite3.connect('database.db')
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()
            cursor.execute(f'SELECT * FROM "table" WHERE name = "{name}"')
            table = cursor.fetchone()
            self.dataset = table

            return 200
        except sqlite3.Error:
            return 400

    def __update_version(self):
        if self.dataset['version'] is None:
            return

        update_to = self.dataset['version'] + 1
        primary, secondary = str(self.dataset['version']).split('.')
        self.dataset['version'] = float(f'{int(primary) + update_to}.{int(secondary) + 1}')

    def edit_dataset(self):
        try:
            if self.dataset['name'] is None:
                return 400
            connection = sqlite3.connect('database.db')
            cursor = connection.cursor()

            self.__update_version()

            dont_edit = ['target', 'instances', 'missing', 'url']

            for key, value in self.dataset.items():
                if (value is None) and (value not in dont_edit):
                    cursor.execute(f'UPDATE "table" SET "{key}={value}" WHERE name = "{self.dataset['name']}"' )

            connection.commit()
            connection.close()
            return 200
        except sqlite3.Error:
            return 400

    def add_dataset(self):
        try:
            connection = sqlite3.connect('database.sqlite')
            cursor = connection.cursor()
            data_table = Orange.data.Table(self.dataset['name'])

            cursor.execute(f'SELECT * FROM "table" WHERE name = "{self.dataset['name']}"')

            cursor.execute(f"""
                INSERT INTO "table"('name', 'title', 'description', 'collection', 'references', 'tags', 'version', 'year', 'source')
                VALUES(
                    "{self.dataset['name']}",
                    "{self.dataset['title']}",
                    "{self.dataset['description']}",
                    "{self.dataset['collection']}",
                    "{self.dataset['references']}",
                )
            
            """)

        finally:
            pass
