import pytest
from app.calc import Calculator

@pytest.fixture
def calculator():
    return Calculator()

def test_multiply(calculator):
    result = calculator.multiply(2, 3)
    assert result == 6

def test_division(calculator):
    result = calculator.division(10, 2)
    assert result == 5

def test_subtraction(calculator):
    result = calculator.subtraction(8, 5)
    assert result == 3

def test_adding(calculator):
    result = calculator.adding(4, 6)
    assert result == 10
