from dataset import Dataset

import urllib.request
import json
data = json.loads(urllib.request.urlopen("https://raw.githubusercontent.com/biolab/datasets/master/__INFO__").read())

for i in data:
    print(i[1]['name'])
    d = {'location': i[0][1]} | i[1]
    element = Dataset(**d)
    element.add()


