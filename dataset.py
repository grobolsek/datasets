import Orange
import yaml

from database import Database


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
            url: str = None,
            location: str = None,
            instances: int = None,
            variables: int = None,
            missing: bool = None,
            target: str = None,
            size: int = None,
            **kwargs,
    ):
        self.calculated = {
            'instances': instances,
            'variables': variables,
            'missing': missing,
            'target': target,
            'size': size,
        }

        self.file = file
        self.kwargs = kwargs

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
            'custom': custom,
            'url': url,
            'location': location,
        }
        self.kwargs_to_yaml()

    def kwargs_to_yaml(self):
        if self.kwargs is not None:
            self.dataset['custom'] = yaml.dump(self.kwargs, default_flow_style=False)

    def add(self):
        table = None

        if self.file is None:
            table = Orange.data.Table(self.dataset['url'])

        else:
            # todo: save file
            pass

        target = table.domain.class_var and ("categorical" if table.domain.class_var.is_discrete else "numeric")

        if self.calculated is None:
            self.calculated = {
                'instances': len(table),
                'variables': len(table.domain),
                'missing': table.has_missing(),
                'target': target,
                # todo: get size
            }

        database = Database(
            dataset=self.dataset | self.calculated
        )

        database.add()

    @staticmethod
    def differences(old, new):
        changed_values = {}

        for key in new:
            # Check if key exists in old_dict and values are different
            if key in old and old[key] != new[key]:
                changed_values[key] = new[key]

        return changed_values

    def edit(self, name: str, **kwargs):
        old_db = Database(dataset={'name': name})
        old = old_db.get_value()
        new = Dataset(**kwargs)

        changed = self.differences(old, new.get_value())

        old.edit(changed)

    def get_value(self):
        return self.dataset

    @staticmethod
    def get_all():
        rows = Database.get_all(Database(dict()))
        res = []
        for row in rows:
            row = dict(row)
            if row['db_references'] is not None:
                row['db_references'] = row['db_references'].split('\n')
            res.append(row)
        return res
