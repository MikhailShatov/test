import requests
import json
import configparser
import telebot

config = configparser.ConfigParser()
config.read('config.ini')
TOKEN = config['TELEGRAM']['TOKEN']

class APIException(Exception):
    def __init__(self, message):
        self.message = message

class CurrencyConverter:
    @staticmethod
    def get_price(base: str, quote: str, amount: str):
        url = 'https://min-api.cryptocompare.com/data/price'
        parameters = {'fsym': base.upper(), 'tsyms': quote.upper()}
        response = requests.get(url, params=parameters)

        try:
            price = json.loads(response.text)[quote.upper()]
            return float(amount) * price
        except KeyError:
            raise APIException(f"Cannot convert {base.upper()} to {quote.upper()}")

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_instructions(message):
    instructions = "Привет, я бот для конвертации валют.\n" \
                   "Для того, чтобы узнать цену валюты, введите следующую команду:\n" \
                   "<имя валюты цену которой вы хотите узнать> <имя валюты в которой хотите узнать цену первой валюты> <количество первой валюты>\n" \
                   "Например: USD RUB 100\n" \
                   "Для получения списка доступных валют введите /values"
    bot.send_message(message.chat.id, instructions)

@bot.message_handler(commands=['values'])
def send_available_currencies(message):
    available_currencies = "Список доступных валют:\n" \
                           "USD - Доллар США\n" \
                           "EUR - Евро\n" \
                           "RUB - Российский рубль"
    bot.send_message(message.chat.id, available_currencies)

@bot.message_handler(content_types=['text'])
def get_currency_price(message):
    try:
        base, quote, amount = message.text.split(' ')
        converted_amount = CurrencyConverter.get_price(base, quote, amount)
        response = f"{amount} {base.upper()} = {converted_amount} {quote.upper()}"
    except APIException as e:
        response = f"Ошибка при получении курса валют: {str(e)}"
    except ValueError:
        response = "Не удалось обработать запрос. Убедитесь, что в запросе три значения: имя валюты, имя валюты, и количество первой валюты."

    bot.send_message(message.chat.id, response)
