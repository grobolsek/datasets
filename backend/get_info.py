import urllib.request
import json
import os

import dataset


for domain, urlp in (("sc", "sc/"), ("core", ""), ):
    url = f"https://raw.githubusercontent.com/biolab/datasets/master/{urlp}__INFO__"
    print(url)
    datasets = json.loads(urllib.request.urlopen(url).read())

    for (*_, location), data in datasets:
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

        if domain == "sc":
            data["custom"] = "\n".join(f"{key}: {data.pop(key)}" for key in ("taxid", "num_of_genes") if key in data)

        dataset_id = dataset.add()
        if (res := dataset.update(dataset_id, data)) is not None:
            dataset.remove(dataset_id)


dataset.update_info_file()
