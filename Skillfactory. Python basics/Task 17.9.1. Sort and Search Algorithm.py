def binary_search(arr, x):

    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] < x:
            left = mid + 1
        else:
            right = mid - 1
    return -1

def sort_list(arr):

    return sorted(arr)

sequence = input("Введите последовательность чисел через пробел: ")
try:
    sequence = list(map(int, sequence.split()))
except ValueError:
    print("Последовательность должна состоять только из чисел!")
    exit()

number = input("Введите любое число: ")
try:
    number = int(number)
except ValueError:
    print("Введено некорректное число!")
    exit()

sorted_sequence = sort_list(sequence)
pos = binary_search(sorted_sequence, number)

if pos == -1:
    print("Введенное число не соответствует заданным условиям!")
else:
    print(f"Номер позиции элемента: {pos}")
