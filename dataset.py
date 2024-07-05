import sqlite3
import Orange


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
    ):

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

            data = {
                "instances": len(data_table),
                "variables": len(data_table.domain),
                "missing": data_table.domain.has_missing(),
                "target": data_table.domain.class_var and ("categorical" if data_table.domain.class_var.is_discrete else "numeric")
            }

            all_data = data | self.dataset

            cursor.execute("SELECT * FROM 'domains'")

            if self.dataset['domain'] not in cursor.fetchall():
                cursor.execute(f'INSERT INTO "domains" (domain_name) VALUES ("{all_data['domain']}")')

            cursor.execute(f"""
                INSERT INTO "table"(name, title, description, collection, reference, version, year, instances, missing, variables, source, url, custom, domain_name, language)
                VALUES(
                    "{all_data['name']}",
                    "{all_data['title']}",
                    "{all_data['description']}",
                    "{all_data['collection']}",
                    "{all_data['references']}",
                    "{all_data['version']}",
                    "{all_data['year']}",
                    "{all_data['instances']}",
                    "{all_data['missing']}",
                    "{all_data['variables']}",
                    "{all_data['source']}",
                    "{all_data['url']}",
                    "{all_data['custom']}",
                    "{all_data['domain_name']}",
                )
            """)

            cursor.execute("""
                
            """)

        except FileNotFoundError:
            return {'File error': f"file {self.dataset['name']} not valid"}, 400
        except sqlite3.Error:
            return 400
