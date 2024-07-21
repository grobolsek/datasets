import urllib.request
import json
import os

import dataset

if not os.path.exists("../data/files"):
    os.makedirs("../data/files")

datasets = json.loads(urllib.request.urlopen("https://raw.githubusercontent.com/biolab/datasets/master/__INFO__").read())

for (domain, location), data in datasets:
    print(f"Adding {data['title']} from {location}")

    data['location'] = location
    data['domain'] = domain
    if 'references' in data:
        data['reference_list'] = "\n\n".join(data.pop('references'))
    data['name'] = data.pop('title')
    data.pop('seealso', None)

    filename = f'../data/files/{location}'
    if os.path.exists(filename):
        data["file"] = open(filename, "rb").read()
    else:
        data["file"] = urllib.request.urlopen(data['url']).read()

    dataset_id = dataset.add()
    dataset.update(dataset_id, data)

dataset.update_info_file()
