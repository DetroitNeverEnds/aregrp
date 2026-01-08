# Настройка линтинга и форматирования

Проект использует ESLint 9.39.1 и Prettier для автоматической проверки и форматирования кода.

## Установленные инструменты

- **ESLint** - статический анализатор кода для JavaScript/TypeScript
- **Prettier** - форматтер кода
- **Husky** - git хуки для автоматизации
- **lint-staged** - запуск линтера только для staged файлов

## Конфигурационные файлы

- [`eslint.config.js`](./eslint.config.js) - конфигурация ESLint
- [`.prettierrc.json`](./.prettierrc.json) - настройки Prettier
- [`.prettierignore`](./.prettierignore) - исключения для Prettier
- [`.lintstagedrc.json`](./.lintstagedrc.json) - конфигурация lint-staged
- [`.husky/pre-commit`](./.husky/pre-commit) - git хук для pre-commit

## Доступные команды

```bash
# Проверка кода
npm run lint

# Автоматическое исправление ошибок ESLint
npm run lint:fix

# Форматирование всех файлов
npm run format

# Проверка форматирования без изменений
npm run format:check
```

## Автоматическое форматирование

### В VSCode

Настройки VSCode уже сконфигурированы в [`../.vscode/settings.json`](../.vscode/settings.json):

- Автоматическое форматирование при сохранении файла
- Автоматическое исправление ошибок ESLint при сохранении
- Prettier установлен как форматтер по умолчанию

### При коммите

Git хук `pre-commit` автоматически запускает линтинг и форматирование для всех staged файлов перед коммитом.

## Настройка git хуков

Git хуки находятся в директории `.husky` внутри frontend. Для их активации выполните:

```bash
git config core.hooksPath frontend/.husky
```

Эта команда уже выполнена при настройке проекта.

## Правила форматирования

- Одинарные кавычки для строк
- Точка с запятой в конце выражений
- Максимальная длина строки: 100 символов
- Отступы: 2 пробела
- Окончание строк: LF (Unix-style)

## Правила ESLint

- Интеграция с TypeScript
- Правила для React Hooks
- Правила для React Refresh
- Правила для Storybook
- Неиспользуемые переменные с префиксом `_` игнорируются
