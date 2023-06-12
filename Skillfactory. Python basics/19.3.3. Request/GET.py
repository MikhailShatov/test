import requests

url = 'https://petstore.swagger.io/v2/pet/findByStatus?status=available'
response = requests.get(url)
print(response.json())
