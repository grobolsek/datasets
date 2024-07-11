import Orange
import yaml
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
        self.kwargs_to_yaml()

    def kwargs_to_yaml(self):
        if self.dataset['custom'] is not None:
            self.dataset['custom'] = yaml.dump(self.dataset['custom'], default_flow_style=False)

    def add(self):
        if self.check_exists():
            return

        table = None

        if self.file is None:
            table = Orange.data.Table(self.dataset['url'])
        else:
            pass  # Implement file handling if needed

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
        old = Database(dataset={'name': self.dataset['name']})
        if kwargs.get('version') is not None:
            kwargs['version'] = self.dataset['version']
        old.edit(kwargs)

    def get_value(self):
        return self.dataset

    @staticmethod
    def get_all():
        return Database(dataset={}).get_all()

    def check_exists(self):
        return Database({'name': self.dataset['name']}).check_exists()

    def change_version(self):
        if self.dataset['version'] is None:
            return
        primary, secondary = self.dataset['version'].split('.')
        secondary = int(secondary) + 1
        return f'{primary}.{secondary}'
