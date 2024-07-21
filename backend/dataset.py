import urllib.request
import os.path
import json

import yaml
import Orange

from database import Database


def add() -> int:
    """
    Adds a new dataset to the database and return its dataset_id
    """
    db = Database()
    db.execute_with_retry('INSERT INTO datasets DEFAULT VALUES')
    return db.cursor.lastrowid


def update(dataset_id: int, changes: dict):
    """
    Updates the dataset with the specified changes.
    """
    db = Database()

    def update_tags():
        tags = changes.pop('tags', None)
        if tags is None:
            return False

        db.execute_with_retry(
            'DELETE FROM datasets_tags WHERE dataset_id = ?',
            (dataset_id, )
        )
        if tags:
            slots = ', '.join(['(?, ?)'] * len(tags))
            db.execute_with_retry(
                f'INSERT INTO datasets_tags (dataset_id, tag) VALUES {slots}',
                sum(([dataset_id, tag] for tag in tags), []))
        return True

    def update_file():
        file = changes.pop('file', None)
        location = changes.get('location', None)
        if file is None and location is None:
            return False

        # Remove any existing file
        old_location = db.fetchsingle(
            "SELECT location FROM datasets WHERE dataset_id = ?",
            (dataset_id,))
        if old_location is not None and os.path.exists(old_location):
            os.remove(f'../data/files/{old_location}')
        location = location or old_location
        filename = f'../data/files/{location}'

        if file is not None:
            # ... if it's None, we're filling the database with existing files
            with open(filename, "wb") as f:
                f.write(file)

        table = Orange.data.Table(filename)

        target = ("none" if table.domain.class_var is None
                  else "categorical" if table.domain.class_var.is_discrete
        else "numeric")
        changes.update({
            'instances': len(table),
            'variables': len(table.domain),
            'missing': table.has_missing(),
            'target': target,
            'size': os.path.getsize(filename)
        })
        return True

    def set_version():
        old_version = db.fetchsingle(
            "SELECT version FROM datasets WHERE dataset_id = ?",
            (dataset_id, )
        )

        # If new version is provided, check that it is greater than the old one
        if "version" in changes and old_version is not None:
            assert changes["version"].split(".") > old_version.split(".")
            return

        # If no version is provided and there was none before, set it to 1.0
        if old_version is None:
            changes["version"] = "1.0"
            return "1.0"

        # Otherwise, increment the minor version
        primary, secondary = old_version.split(".")
        secondary = int(secondary) + 1
        changes["version"] = f'{primary}.{secondary}'

    changes = changes.copy()
    changed = update_tags() + update_file() # call both, no short-circuit!

    if changes or changed:
        set_version()

    if not changes:
        return

    columns, values = zip(*changes.items())
    set_clause = ', '.join(f"{key} = ?" for key in columns)
    db.execute_with_retry(
        f"UPDATE datasets SET {set_clause} WHERE dataset_id = ?",
        tuple(values) + (dataset_id, ))
    update_info_file()


def remove(dataset_id):
    """
    Removes the dataset from the database.
    """
    Database().execute_with_retry(
        'DELETE FROM datasets WHERE dataset_id = ?',
        (dataset_id,)
    )
    update_info_file()



def get_data(dataset_id):
    db = Database()

    data = db.fetchone(
        "SELECT * FROM datasets WHERE dataset_id = ?",
        (dataset_id,))
    assert data
    dataset = dict(data)

    rows = db.fetchall(
        "SELECT tag FROM datasets_tags WHERE dataset_id = ?",
        (dataset_id,))
    dataset["tags"] = [row[0] for row in rows]
    return dataset


def update_info_file():
    rows = Database().fetchall(f"""
        SELECT *, GROUP_CONCAT(dt.tag, ', ') as tags
        FROM datasets d
        LEFT JOIN datasets_tags dt ON d.dataset_id = dt.dataset_id
        GROUP BY d.dataset_id
        """)
    datasets = []
    for row in rows:
        dataset = dict(row)
        del dataset['dataset_id']
        dataset["title"] = dataset["name"]
        dataset["name"], _ = os.path.splitext(dataset["location"])
        dataset["url"] = f"http://localhost/files/{dataset['location']}"
        dataset['tags'] = dataset['tags'].split(', ') if dataset['tags'] else []
        if references := dataset.pop("reference_list", None):
            dataset['references'] = references.split('\n\n')
        if custom := dataset.pop("custom", None):
            dataset.update(yaml.load(custom, Loader=yaml.Loader))
        datasets.append(
            [[dataset.pop("domain", "core"),
              dataset.pop("location")],
             dataset]
        )
    with open("../data/__INFO__", "w") as f:
        json.dump(datasets, f, indent=2)
    return datasets
