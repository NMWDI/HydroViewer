#
# Copyright 2007 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import time
from datetime import datetime
from functools import reduce

import requests
from flask import Flask, render_template
import csv

from flask import Flask, render_template, request

app = Flask(__name__)


@app.route('/')
def root():
    cfg = {"center_lat": 33.5,
           "center_lon": -104.5,
           "zoom": 7}
    return render_template('index.html',
                           map_cfg=cfg,
                           title='PVACD Hydrograph Viewer')


@app.route('/info')
def info():
    return render_template('info.html')


@app.route('/mychart')
def mychart():
    return render_template('mychart.html')


@app.route('/datasets')
def datasets():
    return render_template('datasets.html')


#
# @app.route('/datasets/nmbgmr_wells')
# def nmbgmr_wells():
#     return render_template('datasets.html', dataset='nmbgmr_wells')
#
#
# @app.route('/datasets/nmbgmr_most_recent_water_levels')
# def nmbgmr_most_recent_water_levels():
#     return render_template('datasets.html', dataset='nmbgmr_most_recent_water_levels')


@app.route('/mywell')
def mywell():
    cfg = {"center_lat": 32.5551493,
           "center_lon": -104.4467543,
           "zoom": 12,
           "mywell_id": 8807,
           "mywell_name": 'OW-2'}
    return render_template('mywell.html',
                           map_cfg=cfg,
                           title='MyWell Hydrograph Viewer')


@app.route('/map')
def mymap():
    cfg = {"center_lat": 33.5,
           "center_lon": -104.5,
           "zoom": 7}
    return render_template('map.html',
                           map_cfg=cfg)


@app.route('/active_monitoring_wells')
def active_monitoring_wells():
    cfg = {"center_lat": 35,
           "center_lon": -106.5,
           "zoom": 6}

    with open('./static/active_monitoring_wells.csv', 'r') as rfile:
        reader = csv.DictReader(rfile)
        locations = list(reader)

    usgs_locations = [l for l in locations if
                      l['Managing_Agency'] == 'USGS' and l['Type']!='Long-term continuos site']
    usgs_continuous = [l for l in locations if
                      l['Managing_Agency'] == 'USGS' and l['Type']=='Long-term continuos site']
    nmbgmr_locations = [l for l in locations if l['Managing_Agency'] == 'NMBGMR']

    return render_template('active_monitoring_wells.html',
                           map_cfg=cfg,
                           usgs_locations=usgs_locations,
                           nmbgmr_locations=nmbgmr_locations,
                           usgs_continuous=usgs_continuous)


def get_monthly_average_well(month, datastream):
    """
    get the average for this month for this well
    """
    obsurl = datastream['@iot.selfLink']
    now = datetime.now()
    low = f'{now.year}-{month:02n}-01:00:00:00.000Z'
    if month == 12:
        high = f'{now.year}-{month + 1:02n}-01:00:00:00.000Z'
    else:
        high = f'{now.year}-{month:02n}-31:00:00:00.000Z'

    obsurl = f'{obsurl}/Observations?$filter=phenomenonTime ge {low} and phenomenonTime lt {high}'
    resp = requests.get(obsurl)
    if resp.status_code == 200:
        obs = resp.json()['value']
        results = [o['result'] for o in obs]

        return average(results)


def average(vs):
    return reduce(lambda a, b: (a + b) / 2, vs)


def get_monthly_average():
    url = 'https://st2.newmexicowaterdata.org/FROST-Server/v1.1/Locations'
    resp = requests.get(f"{url}?$filter=properties/agency eq 'PVACD'&$expand=Things/Datastreams")
    if resp.status_code == 200:
        months = [average(
            [get_monthly_average_well(i + 1, location['Things'][0]['Datastreams'][0])
             for location in resp.json()['value']]
        ) for i in range(12)]

        return months


MONTHLY_AVG = get_monthly_average()

LAST_UPDATE = time.time()


@app.route('/pvacd_monthly_average')
def make_pvacd_monthly_average():
    global MONTHLY_AVG, LAST_UPDATE
    if MONTHLY_AVG is None or time.time() - LAST_UPDATE > 60 * 60 * 24:
        MONTHLY_AVG = get_monthly_average()
        LAST_UPDATE = time.time()

    return MONTHLY_AVG


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.

    get_monthly_average()
    app.run(host='127.0.0.1', port=8080, debug=True)
