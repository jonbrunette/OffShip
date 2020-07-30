import ast
import atexit
import csv
import json
import os
import random
import time


from flask import Flask
from flask_restx import Api, Resource, fields, reqparse

app = Flask(__name__)

api = Api(app, version='1.0', title='Cloud Carbon Project Server API',
    description='An MVP version of an api to retrieve carbon credit projects relevant to a user\'s purchase',
    prefix='/v1'
)

from cloudant.client import Cloudant

#The following code gets the API credential from the local directory this code is stored. 
#Script expects a file called credential.txt
"""
with open("credentials.txt", "r") as f:
    credentials = f.read()
    api_access = ast.literal_eval(credentials)


api_access = {
 "apikey": "hKViK1hMEXZ6dXE4iDQxj08VrGGQX_DuRRQGVAzYyMec",
  "host": "10c15879-bb7b-44d5-bad4-83449f9901a5-bluemix.cloudantnosqldb.appdomain.cloud",
  "iam_apikey_description": "Auto-generated for key a1ffcc60-f909-494d-851f-31c188eb1a9e",
  "iam_apikey_name": "Service credentials-1",
  "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
  "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/0230584e85b5426aa995a7575621f698::serviceid:ServiceId-ef74dd34-dbc5-4557-b185-5dd347341615",
  "url": "https://10c15879-bb7b-44d5-bad4-83449f9901a5-bluemix.cloudantnosqldb.appdomain.cloud",
  "username": "10c15879-bb7b-44d5-bad4-83449f9901a5-bluemix"
 }

client = Cloudant.iam(
    api_access['username'],
    api_access['apikey'],
    connect=True
)
"""

#################################

if 'VCAP_SERVICES' in os.environ:
    vcap = json.loads(os.getenv('VCAP_SERVICES'))
    print('Found VCAP_SERVICES')
    if 'cloudantNoSQLDB' in vcap:
        creds = vcap['cloudantNoSQLDB'][0]['credentials']
        user = creds['username']
        #password = creds['password']
        api_key = creds['apikey']
        #url = 'https://' + creds['host']
        url = creds['url']
        client = Cloudant.iam(user, api_key, connect=True)
        #db = client.create_database(db_name, throw_on_exists=False)
elif "CLOUDANT_URL" in os.environ:
    client = Cloudant(os.environ['CLOUDANT_USERNAME'], os.environ['CLOUDANT_PASSWORD'], url=os.environ['CLOUDANT_URL'], connect=True)
    db = client.create_database(db_name, throw_on_exists=False)
elif os.path.isfile('vcap-local.json'):
    with open('vcap-local.json') as f:
        vcap = json.load(f)
        print('Found local VCAP_SERVICES')
        creds = vcap['services']['cloudantNoSQLDB'][0]['credentials']
        user = creds['username']
        #password = creds['password']
        api_key = creds['apikey']
        #url = 'https://' + creds['host']
        url = creds['url']
        client = Cloudant.iam(user, api_key, connect=True)
        #db = client.create_database(db_name, throw_on_exists=False)

# On IBM Cloud Cloud Foundry, get the port number from the environment variable PORT
# When running this app on the local machine, default the port to 8000

print("PORT IN OS ENV IS = {}".format(os.getenv('PORT')))

port = int(os.getenv('PORT', 8000))



project_ns = api.namespace('project', description='User Cloud Project Operations')


# Define the API models we will use (these will show up in the Swagger Specification).

project = api.model('Project', {
    'id' : fields.Integer(readonly=True, description="Carbon offset project UID"),
    'name' : fields.String(required=True, description="The name of the carbon offset project"),
    'description' : fields.String(required=True, description="Description of the carbon offset project"),
    'location' : fields.String(required=True, description="The country in which the project is located"),
    'cost' : fields.Float(required=True, description="The cost per tonne of carbon eliminated associated with this project"),
    'total_cost' : fields.String(required=False, description="The total cost of purchasing offsets, given a value in tonnes of carbon emissions to offset"),
    'url' : fields.String(required=True, description="URL containing more details on the project")
    })

db_name = 'cp-db'

# A Data Access Object to handle the reading and writing of Product records to the Cloudant DB

class ProjectDAO(object):
    def __init__(self):
        if db_name in client.all_dbs():
            self.cp_db = client[db_name]
        else:
            self.cp_db=client.create_database(db_name)
            self.import_data()
            
    def import_data(self):
        """
        Import and insert the data into the cloud database.
        """
        print("Importing Carbon Project Data", end = '', flush=True)
        with open('dummy-project-data.txt') as f:
            reader = csv.reader(f, delimiter=',')
            line_count = 0
            for row in reader:
                if line_count > 0:
                    data = {
                        'id' : row[0],
                        'name' : row[1],
                        'description' : row[2],
                        'location' : row[3],
                        'cost' : float(row[4]),
                        'url' : row[5]
                        }
                    time.sleep(15)
                    self.create(data)
                    print(".", end='', flush=True)
                line_count +=1
        print("Data load complete")
        
    """
    Data Operations
    """
    
    def create(self, data):
        try:
            #TODO: Generate a UID for this
            data['_id'] = data['id']
            my_document = self.cp_db.create_document(data)
            #my_document['id'] = my_document['barcode_id']
        except KeyError:
            api.abort(404, "Project {} already exists in database".format(id))
        return my_document
    
    def update(self):
        pass
    
    def delete(self, id):
        try:
            my_document = self.cp_db[id]
            my_document.delete()
        except KeyError:
            api.abort(404, "Product {} is not present in database".format(id))
        return 
    
    def list(self):
        return [x for x in self.cp_db]
    
    def get(self, id):
        try:
            my_document = self.cp_db[id]
            print(my_document)
        except KeyError:
            api.abort(404, "Product {} not registered".format(id))
        return my_document
    
    def get_with_cost(self,id,tonnes):
        """
        Returns the project with an estimated total cost based on the tonnes of carbon
        emitted 
        """
        
        my_document = self.get(id)
        my_document['total_cost'] = my_document['cost']*tonnes
        return my_document
    
    def get_n_options_with_cost(self,tonnes,n):
        """
        Pick any three projects, and calculate their costs. In the future, the selection
        method should be better than random
        """
        
        # If the user selects more than what we have in the DB, return everything
        if n > len(self.cp_db):
            n = len(self.cp_db)
        
        project_list = random.sample(list(self.cp_db),n)
        for project in project_list:
            project['total_cost'] = round(project['cost'] * tonnes, 2)
        
        return project_list    


# Handlers for the actual API urls

# In a more production orientated version, you might well split these endpoints into
# those for a consumer (which is really just "look up by barcode"), and those that
# allow manufacturers to publish their product data.

@project_ns.route('')
class Project(Resource):
    @api.marshal_with(project)
    @api.doc('List projects')
    def get(self):
        return ProjectDAO().list()
    @api.marshal_with(project, code=201)
    @api.doc(body=project)
    def post(self):
        return ProjectDAO().create(api.payload), 201


@project_ns.route('/<string:id>')
class ProjectWithID(Resource):
    @api.marshal_with(project)
    @api.doc(params={'id' : 'The unique ID of this product'})
    def get(self, id):
        return ProjectDAO().get(id)
    
    
    @api.marshal_with(project)
    @api.doc(params={'id' : 'The unique ID of this product'})
    def delete(self, id):
        return ProjectDAO.delete(id)
"""
@project_ns.route('/<string:id>/<float:tonnes>')
class ProjectWithIDAndCost(Resource):
    @api.marshal_with(project)
    @api.doc(params={'id' : 'the unique ID of this product', 'tonnes': 'The number of tonnes of carbon emissions to offset'})
    
    def get(self,id, tonnes):
        return ProjectDAO().get_with_cost(id, tonnes)
"""

@project_ns.route('/project_with_cost')
class ProjectWithCost(Resource):
    @api.marshal_with(project)
    @api.doc(params={'units':'Units of the mass of carbon emitted. Currently supported values are tonne, long_ton, short_ton, and kilogram',
                     'amount':'The mass of carbon emiited',
                     'n':'The number of projects to return' 
                     })
    
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('units', choices=('tonne','long_ton','short_ton','kilogram'), 
                            default="tonne" ,location='args', help='{error_msg}')
        parser.add_argument('amount', required=True, location='args')
        parser.add_argument('n', required=True,type=int, location='args')
        args = parser.parse_args()
        
        unit_conversion={
            'short_ton':0.9072,
            'long_ton':1.016047,
            'tonne':1,
            'kilogram':0.001
            }
        
        user_units = args['units']
        scale_factor = unit_conversion[user_units]
        return ProjectDAO().get_n_options_with_cost(float(args['amount']) * scale_factor, args['n'])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port, debug=True)

