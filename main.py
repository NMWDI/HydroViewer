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
from flask import Flask, render_template

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


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
