# Тестирование Frontend

## Обзор

Проект использует [Vitest](https://vitest.dev/) для unit-тестирования и [Testing Library](https://testing-library.com/) для тестирования React компонентов.

## Структура тестов

```
frontend/
├── src/
│   ├── test/
│   │   └── setup.ts          # Настройка окружения для тестов
│   ├── **/*.test.tsx          # Тестовые файлы рядом с компонентами
│   └── **/*.spec.tsx          # Альтернативное расширение для тестов
└── vitest.config.ts           # Конфигурация Vitest
```

## Запуск тестов

### Основные команды

```bash
# Запустить все тесты один раз
npm test

# Запустить тесты в watch режиме (автоматический перезапуск при изменениях)
npm run test:watch

# Запустить тесты с отчетом о покрытии кода
npm run test:coverage
```

### Через скрипт

```bash
# Использование bash скрипта
./scripts/test.sh
```

## Написание тестов

### Базовый пример теста компонента

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
    it('должен рендериться без ошибок', () => {
        const { container } = render(<MyComponent />);
        expect(container.firstChild).toBeTruthy();
    });

    it('должен отображать правильный текст', () => {
        const { getByText } = render(<MyComponent text="Hello" />);
        expect(getByText('Hello')).toBeInTheDocument();
    });
});
```

### Тестирование с i18n

Тесты автоматически инициализируют i18next через `setup.ts`, поэтому компоненты с переводами работают корректно:

```typescript
import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    return <div>{t('welcome')}</div>;
}

// Тест будет работать без дополнительной настройки
it('должен отображать переведенный текст', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText(/welcome/i)).toBeInTheDocument();
});
```

## Конфигурация

### vite.config.ts

Основные настройки тестирования:

- **globals**: `true` - глобальные функции тестирования (describe, it, expect)
- **environment**: `jsdom` - эмуляция браузерного окружения
- **setupFiles**: настройка окружения перед запуском тестов
- **coverage**: настройки отчета о покрытии кода

### Покрытие кода

Отчет о покрытии генерируется в директории `coverage/` и включает:

- Текстовый отчет в консоли
- HTML отчет для просмотра в браузере
- JSON отчет для CI/CD

Исключения из покрытия:

- `node_modules/`
- `src/test/`
- `*.d.ts` файлы
- `*.config.*` файлы
- `mockData`
- `src/main.tsx`

## CI/CD

Тесты автоматически запускаются в GitHub Actions при:

- Push в ветки `main` и `develop`
- Pull Request в ветки `main` и `develop`
- Изменениях в директории `frontend/`

См. `.github/workflows/frontend-test.yml` для деталей.

## Лучшие практики

1. **Размещение тестов**: Создавайте тестовые файлы рядом с тестируемыми компонентами
2. **Именование**: Используйте расширения `.test.tsx` или `.spec.tsx`
3. **Описание тестов**: Используйте понятные описания на русском языке
4. **Изоляция**: Каждый тест должен быть независимым
5. **Покрытие**: Стремитесь к покрытию критичных путей кода
6. **Моки**: Используйте моки для внешних зависимостей

## Отладка тестов

### Просмотр рендера компонента

```typescript
import { render, screen } from '@testing-library/react';

it('отладка', () => {
    const { debug } = render(<MyComponent />);
    debug(); // Выведет HTML в консоль
});
```

### Использование screen

```typescript
import { render, screen } from '@testing-library/react';

it('поиск элементов', () => {
    render(<MyComponent />);
    screen.debug(); // Выведет весь DOM
    const element = screen.getByRole('button');
    expect(element).toBeInTheDocument();
});
```

## Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
