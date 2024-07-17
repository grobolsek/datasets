from collections import defaultdict
import sqlite3
from dataset import Dataset

import Orange
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/datasets/get')
def get_datasets():
    return Dataset.get_all()


@app.route('/datasets/table/<string:table_name>/<string:column_name>')
def get_table(column_name, table_name):
    return Dataset.get_table(column_name, table_name), 200


@app.route('/datasets/get/<string:dataset_name>')
def get_datasets_single(dataset_name):
    d = Dataset(name=dataset_name)
    data = d.get_value()
    data['db_tags'] = data.pop('tags')
    return data, 200


@app.route('/datasets/remove/<dataset_name>', methods=['DELETE'])
def remove_dataset(dataset_name):
    connection = sqlite3.connect('datasets.sqlite')
    cursor = connection.cursor()
    cursor.execute('DELETE FROM datasets WHERE db_name = ?', (dataset_name,))
    connection.commit()
    connection.close()
    return {"message": f"Dataset '{dataset_name}' has been deleted successfully."}, 200


@app.route('/datasets/edit/<dataset_name>', methods=['PUT'])
def edit_dataset(dataset_name):
    changes = request.get_json()
    print(changes)
    try:
        d = Dataset(name=dataset_name)
        d.edit(**changes)
        data = d.get_value()
        data['db_tags'] = data.pop('tags')
        return data, 200
    except Exception as e:
        return {"message": str(e)}, 400


if __name__ == '__main__':
    app.run()
