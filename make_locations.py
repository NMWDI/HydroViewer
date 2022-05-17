# ===============================================================================
# Copyright 2022 ross
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ===============================================================================
import json

import requests

jobj = requests.get('https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Locations?$orderby=id&$filter=properties/agency%20eq%20%27OSE-Roswell%27')

with open('ose_roswell.json', 'w') as wfile:
    locations = []
    obj = {}
    for ji in jobj.json()['value']:
        locations.append({'@iot.id': ji['@iot.id'], 'name': ji['']})

    obj['locations'] = locations
    json.dump(obj, wfile, indent=2)

# ============= EOF =============================================
