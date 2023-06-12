import requests

url = 'https://petstore.swagger.io/v2/pet/12345'
response = requests.delete(url)
print(response.status_code)
