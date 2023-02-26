from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

# Настройка драйвера Chrome
driver = webdriver.Chrome(executable_path='/path/to/chromedriver')

# Перейти в Google
driver.get("https://www.google.com")

# Найти элемент поисковой строки
search_box = driver.find_element_by_name("q")

# Ввести поисковый запрос
search_box.send_keys("Selenium automation testing")
search_box.send_keys(Keys.RETURN)

# Дождаться загрузки результатов поиска
time.sleep(3)

# Проверять результаты поиска
assert "Selenium automation testing" in driver.title

# Закрыть браузер
driver.quit()