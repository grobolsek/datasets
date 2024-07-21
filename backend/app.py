from collections import defaultdict
import json
import os
import sqlite3

import Orange
from flask import Flask, request
from flask_cors import CORS

import dataset, datasets


if not os.path.exists("../data/files"):
    os.makedirs("../data/files")


app = Flask(__name__)
CORS(app)

@app.route('/datasets/get', methods=['GET'])
def get_datasets():
    return datasets.get_all()


@app.route("/datasets/tags")
def get_tags():
    return datasets.get_tags(), 200


@app.route("/datasets/languages")
def get_languages():
    return datasets.get_languages(), 200


@app.route("/datasets/domains")
def get_domains():
    return datasets.get_domains(), 200


@app.route('/datasets/get/<string:dataset_id>')
def get_dataset(dataset_id):
    return dataset.get_data(dataset_id).get(), 200


@app.route('/datasets/edit/<dataset_id>', methods=['POST'])
def edit_dataset(dataset_id):
    data = json.loads(request.form["data"])
    if "file" in request.files:
        data["file"] = request.files["file"].read()
    if dataset_id == "-1":
        dataset_id = dataset.add()
    if (res := dataset.update(dataset_id, data)) is not None:
        return res
    return dataset.get_data(dataset_id), 201


@app.route('/datasets/remove/<dataset_id>', methods=['GET'])
def remove_dataset(dataset_id):
    dataset.remove(dataset_id)
    return '', 204


if __name__ == '__main__':
    app.run(debug=True)
