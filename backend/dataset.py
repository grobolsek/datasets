import urllib.request

import yaml
import Orange

from database import Database


class Dataset:
    def __init__(self, **kwargs):
        self.calculated = {
            'instances': kwargs.get('instances'),
            'variables': kwargs.get('variables'),
            'missing': kwargs.get('missing'),
            'target': kwargs.get('target'),
            'size': kwargs.get('size'),
        }
        self.file = kwargs.get('file')
        self.dataset = {
            'name': kwargs.get('name'),
            'title': kwargs.get('title'),
            'description': kwargs.get('description'),
            'collection': kwargs.get('collection'),
            'references': kwargs.get('references'),
            'tags': kwargs.get('tags', []),
            'version': kwargs.get('version'),
            'year': kwargs.get('year'),
            'source': kwargs.get('source'),
            'language': kwargs.get('language'),
            'domain': kwargs.get('domain'),
            'custom': kwargs.get('custom'),
            'url': kwargs.get('url'),
            'location': kwargs.get('location'),
        }

    def add(self):
        if self.check_exists():
            return

        table = None

        filename = f'../data/files/{self.dataset["location"]}'
        if self.file is None:
            urllib.request.urlretrieve(self.dataset['url'], filename)
        else:
            with open(file, "rb") as f:
                f.write(self.file)
        table = Orange.data.Table(filename)

        target = table.domain.class_var and ("categorical" if table.domain.class_var.is_discrete else "numeric")

        if not any(self.calculated.values()):
            self.calculated.update({
                'instances': len(table),
                'variables': len(table.domain),
                'missing': table.has_missing(),
                'target': target,
                'size': None  # Implement size calculation if needed
            })

        database = Database(dataset={**self.dataset, **self.calculated})
        database.add()

    def edit(self, **kwargs):
        old = Database(dataset={'location': self.dataset['location']})
        if kwargs.get('version') is not None:
            kwargs['version'] = self.change_version(kwargs['version'])

        print(kwargs)
        old.edit(kwargs)

    def get_value(self):
        return Database(dataset={'location': self.dataset['location']}).get_value()

    @staticmethod
    def get_all():
        return Database(dataset={}).get_all()

    def check_exists(self):
        return Database({'location': self.dataset['location']}).check_exists()

    @staticmethod
    def change_version(version: str):
        primary, secondary = version.split('.')
        secondary = int(secondary) + 1
        return f'{primary}.{secondary}'

    @staticmethod
    def get_table(column_name, table_name):
        return Database(dataset={}).get_tables(column_name=column_name, table_name=table_name)
