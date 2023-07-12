from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Создаем экземпляр веб-драйвера Google Chrome
driver = webdriver.Chrome()

# Настройка неявного ожидания всех элементов
driver.implicitly_wait(10)  # Ждем до 10 секунд, если элемент не найден

# Открываем веб-страницу
driver.get("https://petfriends.skillfactory.ru/all_pets")

# Проверка карточек питомцев
pet_cards = driver.find_elements(By.CLASS_NAME, "card")
for card in pet_cards:
    # Проверяем наличие фото, имени и возраста питомца
    photo = card.find_element(By.CLASS_NAME, "card-img-top")
    name = card.find_element(By.CLASS_NAME, "card-title")
    age = card.find_element(By.CLASS_NAME, "card-text")

    assert photo.is_displayed(), "Фото питомца не отображается"
    assert name.is_displayed(), "Имя питомца не отображается"
    assert age.is_displayed(), "Возраст питомца не отображается"

# Проверка таблицы питомцев
table = driver.find_element(By.ID, "allRecords")
# Явное ожидание таблицы питомцев
table_present = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.ID, "allRecords"))
)

# Закрываем веб-драйвер
driver.quit()