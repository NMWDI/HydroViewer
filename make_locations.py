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


def make_locations(url, out, source):
    print(url)
    jobj = requests.get(url)
    print(jobj)
    with open('{}.json'.format(out), 'w') as wfile:

        obj = {}
        # print(jobj)
        # for ji in jobj.json()['value']:
        #     locations.append({'@iot.id': ji['@iot.id'], 'name': ji['']})
        locations = jobj.json()['value']
        for l in locations:
            l['source'] = source
        obj['locations'] =  locations
        json.dump(obj, wfile, indent=2)


if __name__ == '__main__':
    url = 'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Locations?$orderby=id&$filter=properties/agency%20eq%20%27OSE-Roswell%27'
    out = 'ose_roswell'
    make_locations(url, out, 'OSE-Roswell')
    # points = ['-105.70 34.73', '-103.05 34.73',
    #           '-105.70 32.3',  '-103.05 32.3',
    #           '-105.70 34.73'
    #           ]
    # points = ','.join(points)

    points = ['-105.70 34.73', '-103.05 34.73',
              '-105.70 32.3',  '-103.05 32.3',
              '-105.70 34.73'
              ]
    points = ','.join(points)
    url = "https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Locations?$filter=properties/agency eq 'NMBGMR' and " \
          "st_within(" \
          "Location/location, " \
          "geography'POLYGON (({" \
          "}))')".format(points)

    out = 'nmbgmr'
    make_locations(url, out, 'NMBGMR')
    # out = 'usgs_pvacd'
    # make_locations(url, out, 'USGS')
# ============= EOF =============================================
