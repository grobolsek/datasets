from collections import defaultdict

import Orange
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

datasets_info: dict = dict(Orange.datasets.items())


def get_values(keys: list) -> dict[str: list]:
    """
    :param keys: list of keys
    :return: values of keys
    """
    values = defaultdict(set)
    for i in datasets_info.values():
        for key, value in i.items():
            if type(value) is dict:
                for k, v in value.items():
                    if k in keys:
                        values[k].add(v)
            elif key in keys:
                values[key].add(value)

    return {key: list(value) for key, value in values.items()}


@app.route('/datasets/get/info/')
def datasets_api_info():
    return datasets_info


@app.route('/datasets/get/info/values/<string:keys>')
def datasets_api_info_values(keys):
    try:
        return get_values(keys.split(";"))
    except ValueError:
        return {'Error': 'No values found for given keys.'}


@app.route('/datasets/remove/<dataset_name>', methods=['DELETE'])
def remove_dataset(dataset_name):
    # todo: code for removing
    return {"message": f"Dataset '{dataset_name}' has been deleted successfully."}, 200
    pass


@app.route('/datasets/edit/<dataset_name>', methods=['EDIT'])
def edit_dataset(dataset_name):
    # todo: code for changing
    pass


if __name__ == '__main__':
    app.run()
