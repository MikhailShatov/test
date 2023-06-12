import requests
import json

url = 'https://petstore.swagger.io/v2/pet'
headers = {'Content-Type': 'application/json'}
data = {
    "id": 12345,
    "category": {
        "id": 0,
        "name": "string"
    },
    "name": "doggie",
    "photoUrls": [
        "string"
    ],
    "tags": [
        {
            "id": 0,
            "name": "string"
        }
    ],
    "status": "available"
}
response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
