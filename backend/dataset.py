import urllib.request
import os.path
import json
from tempfile import TemporaryDirectory

import yaml
import Orange

from database import Database
from utils import get_url


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
    class DatasetError(Exception):
        def __init__(self, message, status):
            self.message = message
            self.status = status

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
        location = changes.get('location')
        assert (file is None) == (location is None), \
            "Either both or neither file and location should be provided"
        if file is None:
            return False

        domain = changes.get('domain')
        if domain is None:
            domain = db.fetchsingle(
                "SELECT domain FROM datasets WHERE dataset_id = ?",
                (dataset_id, ))
            if domain is None:
                domain = "core"

        existing = db.fetchsingle(
            """SELECT name FROM datasets
               WHERE location = ? AND domain = ? AND dataset_id != ?""",
            (location, domain, dataset_id))
        if existing is not None:
            raise DatasetError(
              f"File with the same name already exists for data set '{existing}'",
              409)

        with TemporaryDirectory() as tempdir:
            tempfilename = os.path.join(tempdir, location)
            with open(tempfilename, "wb") as f:
                f.write(file)
            try:
                table = Orange.data.Table(tempfilename)
            except Exception as e:
                raise DatasetError(f"Unreadable file: {e}", 400) from e

            directory = os.path.join("..", "data", "files", domain)
            filename = os.path.join(directory, location)
            os.makedirs(directory, exist_ok=True)
            os.replace(tempfilename, filename)

        old_location = db.fetchone(
            "SELECT location, domain FROM datasets WHERE dataset_id = ?",
            (dataset_id,))
        if old_location is not None and old_location[0]:
            old_location, old_domain = old_location
            old_filename = os.path.join("..", "data", "files", old_domain, old_location)
            # old file may not exist if we're debugging something, so let's check
            if old_filename != filename and os.path.exists(old_filename):
                print(f"X{old_location}X{old_domain}X{old_filename}X")
                os.remove(old_filename)

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

    def check_custom():
        if not (custom := changes.get("custom", "").strip()):
            return
        try:
            custom = yaml.load(changes["custom"], Loader=yaml.Loader)
        except yaml.YAMLError as e:
            raise DatasetError(f"Invalid custom YAML: {e}", 400)
        if not isinstance(custom, dict):
            raise DatasetError("Custom data must be a dictionary", 400)
        non_strings = [key for key in custom if not isinstance(key, str)]
        if non_strings:
            raise DatasetError(f"Custom keys must be strings, not {type(non_string).__name__}", 400)

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

    try:
        changes = changes.copy()
        check_custom()
        is_changed = update_tags() + update_file() # call both, don't short-circuit!
        if changes or is_changed:
            set_version()
    except DatasetError as e:
        return e.message, e.status

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
    sc_datasets = []  # backward compatibility
    for row in rows:
        dataset = dict(row)
        del dataset['dataset_id']
        dataset["title"] = dataset["name"]
        dataset["name"], _ = os.path.splitext(dataset["location"])
        dataset["url"] = get_url(dataset["location"], dataset["domain"])
        dataset['tags'] = dataset['tags'].split(', ') if dataset['tags'] else []
        if references := dataset.pop("reference_list", None):
            dataset['references'] = references.split('\n\n')
        if custom := dataset.pop("custom", None):
            custom_dict = yaml.load(custom, Loader=yaml.Loader)
            assert isinstance(custom_dict, dict)
            dataset.update(custom_dict)
        datasets.append(
            [[dataset.get("domain", "core"),
              dataset["location"]],
             dataset]
        )
        if dataset["domain"] == "sc":
            sc_datasets.append([
                dataset["location"],
                dataset
            ])

    with open("../data/files/__INFO__", "w") as f:
        json.dump(datasets, f, indent=2)
    with open("../data/files/sc/__INFO__", "w") as f:
        json.dump(sc_datasets, f, indent=2)
    return datasets
