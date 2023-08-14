# 1.Тест на валидацию входа по номеру телефона.
def test_valid_phone_number_login():
    phone_number = "1234567890"
    password = "Password123"
    
    open_login_page()
    enter_phone_number(phone_number)
    enter_password(password)
    click_login_button()
    
    assert is_successful_login()  # Проверка на успешную авторизацию

# 2. Тест на валидацию входа по адресу электронной почты.
def test_valid_email_login():
    email = "user@example.com"
    password = "Password123"
    
    open_login_page()
    enter_email(email)
    enter_password(password)
    click_login_button()
    
    assert is_successful_login()  # Проверка на успешную авторизацию

# 3. Тест на валидацию входа по некорректному номеру телефона.
def test_invalid_phone_number_login():
    phone_number = "123"
    password = "Password123"
    
    open_login_page()
    enter_phone_number(phone_number)
    enter_password(password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 4. Тест на валидацию пароля минимальной длины.
def test_min_length_password_validation():
    phone_number = "1234567890"
    short_password = "Pwd123"
    
    open_login_page()
    enter_phone_number(phone_number)
    enter_password(short_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 5. Тест на валидацию пароля минимальной длины
def test_min_length_password_validation():
    email = "user@example.com"
    short_password = "Pwd123"
    
    open_login_page()
    enter_email(email)
    enter_password(short_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 6. Тест на валидацию пароля длиной менее 8 символов
def test_short_password_validation():
    email = "user@example.com"
    short_password = "Pwd123"
    
    open_login_page()
    enter_email(email)
    enter_password(short_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 7. Тест на валидацию пароля максимальной длины.
def test_max_length_password_validation():
    email = "user@example.com"
    long_password = "LongPassword1234567890"
    
    open_login_page()
    enter_email(email)
    enter_password(long_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 8. Тест на валидацию пароля длиной более 50 символов.
def test_long_password_validation():
    email = "user@example.com"
    long_password = "LongPassword1234567890LongPassword1234567890"
    
    open_login_page()
    enter_email(email)
    enter_password(long_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки валидации

# 9. Тест смены пароля после успешной авторизации. 
def test_password_change_after_successful_login():
    phone_number = "1234567890"
    old_password = "OldPassword123"
    new_password = "NewPassword456"
    
    open_login_page()
    enter_phone_number(phone_number)
    enter_password(old_password)
    click_login_button()
    
    assert is_successful_login()  # Проверка на успешную авторизацию
    
    open_password_settings()
    enter_old_password(old_password)
    enter_new_password(new_password)
    confirm_new_password(new_password)
    click_save_button()
    
    assert is_password_changed()  # Проверка на успешное изменение пароля

# 10. Тест смены пароля с некорректным старым паролем.
def test_password_change_with_incorrect_old_password():
    phone_number = "1234567890"
    incorrect_old_password = "IncorrectPassword"
    new_password = "NewPassword456"
    
    open_login_page()
    enter_phone_number(phone_number)
    enter_password(incorrect_old_password)
    click_login_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки при вводе некорректного пароля
    
    open_password_settings()
    enter_old_password(incorrect_old_password)
    enter_new_password(new_password)
    confirm_new_password(new_password)
    click_save_button()
    
    assert is_password_not_changed()  # Проверка на отсутствие изменений пароля

# 11. Тест включения/выключения файлов cookie:
def test_cookie_settings():
    open_login_page()
    enable_cookies()
    click_retry_button()
    
    assert cookies_enabled()  # Проверка на успешное включение cookie
    
    open_login_page()
    disable_cookies()
    click_retry_button()
    
    assert cookies_disabled()  # Проверка на успешное выключение cookie

# 12. Тест восстановления пароля по номеру телефона.
def test_password_recovery_by_phone_number():
    phone_number = "1234567890"
    
    open_recovery_page()
    enter_phone_number(phone_number)
    click_send_code_button()
    
    assert is_code_sent_successfully()  # Проверка на успешную отправку кода
    
    enter_received_code("123456")  # Замените на код, который будет получен
    enter_new_password("NewPassword123")
    confirm_new_password("NewPassword123")
    click_save_password_button()
    
    assert is_password_recovered()  # Проверка на успешное восстановление пароля

# 13. Тест восстановления пароля по адресу электронной почты.
def test_password_recovery_by_email():
    email = "user@example.com"
    
    open_recovery_page()
    enter_email(email)
    click_send_code_button()
    
    assert is_code_sent_successfully()  # Проверка на успешную отправку кода
    
    enter_received_code("123456")  # Замените на код, который будет получен
    enter_new_password("NewPassword123")
    confirm_new_password("NewPassword123")
    click_save_password_button()
    
    assert is_password_recovered()  # Проверка на успешное восстановление пароля

# 14. Тест восстановления пароля по номеру телефона с некорректным кодом.
def test_password_recovery_by_phone_number_with_incorrect_code():
    phone_number = "1234567890"
    
    open_recovery_page()
    enter_phone_number(phone_number)
    click_send_code_button()
    
    assert is_code_sent_successfully()  # Проверка на успешную отправку кода
    
    enter_received_code("123456")  # Замените на некорректный код
    enter_new_password("NewPassword123")
    confirm_new_password("NewPassword123")
    click_save_password_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки при вводе некорректного кода

# 15. Тест восстановления пароля по адресу электронной почты с некорректным кодом.
def test_password_recovery_by_email_with_incorrect_code():
    email = "user@example.com"
    
    open_recovery_page()
    enter_email(email)
    click_send_code_button()
    
    assert is_code_sent_successfully()  # Проверка на успешную отправку кода
    
    enter_received_code("123456")  # Замените на некорректный код
    enter_new_password("NewPassword123")
    confirm_new_password("NewPassword123")
    click_save_password_button()
    
    assert is_validation_error_displayed()  # Проверка на отображение ошибки при вводе некорректного кода
