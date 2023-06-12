# 1. Тестирование метода get_api_key:

# Передача корректных параметров
response = api.get_api_key(valid_auth_key)
assert response.status_code == 200

# Передача неверного ключа авторизации
response = api.get_api_key(invalid_auth_key)
assert response.status_code == 401

# Отсутствие передачи ключа авторизации
response = api.get_api_key()
assert response.status_code == 401

# 2. Тестирование метода get_list_of_pets:

# Передача корректных параметров
response = api.get_list_of_pets(valid_auth_key)
assert response.status_code == 200

# Передача неверного ключа авторизации
response = api.get_list_of_pets(invalid_auth_key)
assert response.status_code == 401

# Отсутствие передачи ключа авторизации
response = api.get_list_of_pets()
assert response.status_code == 401

# 3. Тестирование метода add_new_pet:

# Передача корректных параметров
response = api.add_new_pet(valid_auth_key, pet_data)
assert response.status_code == 200

# Передача пустого тела запроса
response = api.add_new_pet(valid_auth_key, {})
assert response.status_code == 400

# Передача неверного ключа авторизации
response = api.add_new_pet(invalid_auth_key, pet_data)
assert response.status_code == 401


# 4.Тестирование метода delete_pet:

# Передача корректного идентификатора питомца
response = api.delete_pet(valid_auth_key, pet_id)
assert response.status_code == 200

# Передача несуществующего идентификатора питомца
response = api.delete_pet(valid_auth_key, non_existing_pet_id)
assert response.status_code == 404

# Передача неверного ключа авторизации
response = api.delete_pet(invalid_auth_key, pet_id)
assert response.status_code == 401


# 5. Тестирование метода update_pet_info:

# Передача корректных параметров
response = api.update_pet_info(valid_auth_key, pet_id, updated_pet_data)
assert response.status_code == 200

# Передача неверного идентификатора питомца
response = api.update_pet_info(valid_auth_key, non_existing_pet_id, updated_pet_data)
assert response.status_code == 404

# Передача неверного ключа авторизации
response = api.update_pet_info(invalid_auth_key, pet_id, updated_pet_data)
assert response.status_code == 401
