Данный скрипт предназначен для сортировки больших текстовых файлов.
Сортировка осуществляется построчно, по алфавиту.

Для создания текстового файла используется файл createBigFile.js, в командной строке необходимо выполнить команду node createBigFile.js
Для запуска сортировки выполнить команду node sortBigFile.js

Дальнейшие планы, разработать автотесты.

Выявленные ошибки: на больших файлах вылетает ошибка сборщика мусора; при создании большого файла, он должен уже существовать.
