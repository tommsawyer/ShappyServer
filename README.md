**Shappy API server**

Сервер для проекта Shappy.

Ссылки:

+ [Серверная доска трелло](https://trello.com/b/YlfJr12S/mmm-server)

Установка:


1. Установить последнюю версию **node.js** и **npm**. Установить **mongodb**
2. Склонировать проект
3. Выполнить **npm install** из папки с проектом для установки зависимостей
4. Скопировать содержимое папки *sample configs* в папку *configs*
5. Заполнить конфигурационные файлы в папке *configs*
6. Установить image magick в вашу ОС(archlinux: **sudo pacman -S imagemagick**)
   Используется для сжатия и конвертации картинок
7. Запустить **npm start** из папки с проектом для запуска сервера

Для заполнения тестовой базы данных выполнить **npm createdb** из корневой папки проекта.