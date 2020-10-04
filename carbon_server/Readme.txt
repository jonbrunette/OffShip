Jonathan setup:
(All steps mab be faulty and lacking steps in between) 

1) Install python
2) python -m pip install --upgrade pip
3) pip install virtualenv
4) pip install virtualenvwrapper-win
5) pip install flask
6) pip install flask_restx
7) pip install cloudant
8) venv\Scripts\activate
9) python carbon_server.py

Should now see "Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)"

Sample call:
http://127.0.0.1:5000/v1/project/project_with_cost?units=tonne&amount=3.0&n=3

'units': choices=('tonne','long_ton','short_ton','kilogram')

