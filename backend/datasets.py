import json
import yaml

from database import Database

__all__ = ["get_all", "get_tags", "get_languages", "get_domains"]


def get_all():
    rows = Database().fetchall(f"""
        SELECT *, GROUP_CONCAT(dt.tag, ', ') as tags
        FROM datasets d
        LEFT JOIN datasets_tags dt ON d.dataset_id = dt.dataset_id
        GROUP BY d.dataset_id
        """)
    datasets = list(map(dict, rows))
    for dataset in datasets:
        dataset['tags'] = dataset['tags'].split(', ') if dataset['tags'] else []
    return {dataset["dataset_id"]: dataset for dataset in datasets}


def get_tags():
    return _get_distinct("tag", "datasets_tags")


def get_languages():
    return _get_distinct("language", "datasets")


def get_domains():
    return _get_distinct("domain", "datasets")


def _get_distinct(column_name, table_name):
    rows = Database().fetchall(f"""
        SELECT DISTINCT {column_name} FROM {table_name}
        WHERE {column_name} IS NOT NULL
        AND {column_name} != ""
        """)
    return sorted(row[0] for row in rows)
