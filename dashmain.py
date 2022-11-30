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
import requests
import sta
from dash import Dash, dcc, html, Input, Output
import os
import plotly.graph_objects as go  # or plotly.express as px
import pandas as pd
import plotly.express as px


resp = requests.get('https://raw.githubusercontent.com/NMWDI/VocabService/main/pvacd_hydroviewer/pvacd_hydrovu.json')
if resp.status_code==200:
    locations = resp.json()['locations']
    lons, lats = zip(*(l['location']['coordinates'] for l in locations))
    names = [l['name'] for l in locations]

# df = pd.read_json('https://raw.githubusercontent.com/NMWDI/VocabService/main/pvacd_hydroviewer/pvacd_hydrovu.json')
# print(df.columns)
# for (i, row) in df.iterrows():
#     row.columns9
#     print(row['location']['coordinates'])


# fig = go.Figure() # or any Plotly Express function e.g. px.bar(...)
mapfig = go.Figure(go.Scattermapbox(
    mode="markers",
    lon=lons,
    lat=lats,
    hovertext=names,
    hoverinfo='text',
    marker={'size': 10}))

mapfig.update_layout(
    margin={'l': 0, 't': 0, 'b': 0, 'r': 0},
    width=800,
    height=800,
    clickmode='event+select',
    mapbox={
        'center': {'lon': -104.5, 'lat': 33.4},
        'style': "stamen-terrain",
        # 'center': {'lon': -20, 'lat': -20},
        'zoom': 7})

chartfig = px.line([1,2,3], [12,3123,12])
# fig.show()
# fig.add_trace( ... )
# fig.update_layout( ... )


external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
app = Dash(__name__, external_stylesheets=external_stylesheets)
server = app.server



app.layout = html.Div([
    html.H2('Hello World'),
    dcc.Dropdown(['LA', 'NYC', 'MTL'],
                 'LA',
                 id='dropdown'
                 ),
    html.Div(id='display-value'),
    html.Div([dcc.Graph(id='map', figure=mapfig),
             dcc.Graph(id='chart', figure=chartfig)])
])


@app.callback(Output('chart', 'children'),
              Input('map', 'selectedData'))
def select_nodes(selected_data):
    print('Callback select_nodes: ', selected_data)
    try:
        idx = selected_data['points'][0]['pointIndex']
        location = locations[idx]
        print(location)
    except TypeError:
        pass

    # requests.get(url)
    # clt = sta.client.Client(base_url='https://st2.newmexicowaterdata.org/FROST-Server/v1.1/')
    # clt.get_location()
    # if not selected_data:
    #     return 'hello'
    # else:
    #     return json.dumps(selected_data, indent=2)


@app.callback(Output('display-value', 'children'),
              [Input('dropdown', 'value')])
def display_value(value):
    return f'You have selected {value}'


if __name__ == '__main__':
    app.run_server(debug=True)
# ============= EOF =============================================
