import sqlite3
import Orange
import yaml
from copy import deepcopy


class Dataset:
    def __init__(
            self,
            name: str = None,
            title: str = None,
            description: str = None,
            collection: str = None,
            references: str = None,
            tags: list[str] = None,
            version: float = None,
            year: int = None,
            source: str = None,
            language: str = None,
            domain: str = None,
            file: str = None,
            custom: str = None,
    ):

        self.file = file

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
            'language': language,
            'domain': domain,
            'custom': custom
        }

        self.combined_datasets = dict()

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

    def _update_version(self):
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

            self._update_version()

            dont_edit = ['target', 'instances', 'missing', 'url', 'variables']

            for key, value in self.dataset.items():
                if (value is None) and (value not in dont_edit):
                    cursor.execute(f'UPDATE "table" SET "{key}={value}" WHERE name = "{self.dataset['name']}"')

            connection.commit()
            connection.close()
            return 200
        except sqlite3.Error:
            return 400

    def combine(self):
        data_table = Orange.data.Table(self.dataset['name'])

        data = {
            "instances": len(data_table),
            "variables": len(data_table.domain),
            "missing": data_table.domain.has_missing(),
            "target": data_table.domain.class_var and (
                "categorical" if data_table.domain.class_var.is_discrete else "numeric")
        }

        self.combined_datasets = data | self.dataset

    def add_dataset(self):
        try:
            # insert file
            Orange.data.Table(self.file)

            # connect to database
            connection = sqlite3.connect('database.sqlite')
            cursor = connection.cursor()

            # add elements that are calculated
            self.combine()

            # get currently available domain
            cursor.execute("SELECT * FROM 'domains'")

            # if domain doesn't exist add one
            if self.dataset['domain'] not in cursor.fetchall():
                cursor.execute(f'INSERT INTO "domains" (domain_name) VALUES ("{self.combined_datasets['domain']}")')

            # insert data
            columns = ', '.join(self.combined_datasets.keys())
            placeholders = ', '.join(['?'] * len(self.combined_datasets))
            sql = f'INSERT INTO my_table ({columns}) VALUES ({placeholders})'

            cursor.execute(sql, tuple(self.combined_datasets.values()))

        except FileNotFoundError:
            return {'File error': f"file {self.dataset['name']} not valid"}, 400
        except sqlite3.Error:
            return 400

    def convert_to_json(self):
        self.combine()
        temp = deepcopy(self.combined_datasets)
        del temp['custom']
        return temp | yaml.safe_load(self.combined_datasets['custom'])
