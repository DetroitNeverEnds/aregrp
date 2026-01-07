# Storybook - Документация

## Обзор

Storybook настроен для разработки и документирования React компонентов с использованием:

- **React 19** + **TypeScript**
- **Vite** как сборщик
- **SASS/SCSS** для стилей
- **CSS Modules** для изоляции стилей

## Запуск Storybook

### Режим разработки

```bash
npm run storybook
```

Storybook будет доступен по адресу: http://localhost:6006

### Сборка для продакшена

```bash
npm run build-storybook
```

Статические файлы будут созданы в папке `storybook-static/`

## Структура проекта

```
frontend/
├── .storybook/              # Конфигурация Storybook
│   ├── main.ts             # Основная конфигурация
│   ├── preview.ts          # Глобальные настройки отображения
│   └── vitest.setup.ts     # Настройки тестирования
├── src/
│   ├── components/         # Компоненты приложения
│   │   └── Card/          # Пример компонента
│   │       ├── Card.tsx
│   │       ├── Card.module.scss
│   │       ├── Card.stories.tsx
│   │       └── index.ts
│   ├── stories/           # Примеры компонентов от Storybook
│   │   ├── Button.tsx
│   │   ├── Button.module.scss
│   │   └── Button.stories.ts
│   └── styles/            # Глобальные стили
│       ├── variables.scss # SCSS переменные
│       └── mixins.scss    # SCSS миксины
```

## Работа со стилями

### SCSS Переменные

Все переменные определены в [`variables.scss`](src/styles/variables.scss):

```scss
@use '../../styles/variables' as *;

.my-component {
    color: $primary-color;
    padding: $spacing-md;
    border-radius: $border-radius-md;
}
```

### SCSS Миксины

Используйте готовые миксины из [`mixins.scss`](src/styles/mixins.scss):

```scss
@use '../../styles/mixins' as *;

.my-component {
    @include flex-center;
    @include transition(transform, opacity);
    @include box-shadow(md);

    @include respond-to(sm) {
        // Стили для мобильных устройств
    }
}
```

### CSS Modules

Все компоненты используют CSS Modules для изоляции стилей:

```tsx
import styles from './MyComponent.module.scss';

export const MyComponent = () => {
    return <div className={styles.container}>...</div>;
};
```

## Создание нового компонента

### 1. Создайте структуру файлов

```
src/components/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss
├── MyComponent.stories.tsx
└── index.ts
```

### 2. Создайте компонент (MyComponent.tsx)

```tsx
import React from 'react';
import styles from './MyComponent.module.scss';

export interface MyComponentProps {
    /** Описание пропса */
    title: string;
    /** Вариант отображения */
    variant?: 'primary' | 'secondary';
}

/**
 * Описание компонента
 */
export const MyComponent = ({ title, variant = 'primary' }: MyComponentProps) => {
    return (
        <div className={`${styles.component} ${styles[`component--${variant}`]}`}>
            <h2>{title}</h2>
        </div>
    );
};
```

### 3. Создайте стили (MyComponent.module.scss)

```scss
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.component {
    padding: $spacing-lg;
    border-radius: $border-radius-md;

    &--primary {
        background-color: $primary-color;
        color: $text-light;
    }

    &--secondary {
        background-color: $secondary-color;
        color: $text-light;
    }
}
```

### 4. Создайте историю (MyComponent.stories.tsx)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
    title: 'Components/MyComponent',
    component: MyComponent,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary'],
        },
    },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        title: 'Заголовок',
        variant: 'primary',
    },
};

export const Secondary: Story = {
    args: {
        title: 'Заголовок',
        variant: 'secondary',
    },
};
```

### 5. Создайте index.ts для экспорта

```tsx
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

## Лучшие практики

### 1. Минимизация кода стилей

- ✅ Используйте переменные вместо хардкода значений
- ✅ Наследуйте классы через `@extend`
- ✅ Группируйте общие стили в миксины
- ✅ Используйте вложенность для связанных селекторов

```scss
// ❌ Плохо
.button-primary {
    padding: 16px 32px;
    background-color: #1ea7fd;
    border-radius: 8px;
}

.button-secondary {
    padding: 16px 32px;
    background-color: #6c757d;
    border-radius: 8px;
}

// ✅ Хорошо
.button {
    padding: $spacing-md $spacing-xl;
    border-radius: $border-radius-md;

    &--primary {
        background-color: $primary-color;
    }

    &--secondary {
        background-color: $secondary-color;
    }
}
```

### 2. Документирование компонентов

- Используйте JSDoc комментарии для пропсов
- Добавляйте описания в argTypes
- Создавайте несколько историй для разных состояний
- Используйте тег `autodocs` для автоматической документации

### 3. Адаптивность

Используйте миксин `respond-to` для адаптивных стилей:

```scss
.component {
    padding: $spacing-xl;

    @include respond-to(md) {
        padding: $spacing-lg;
    }

    @include respond-to(sm) {
        padding: $spacing-md;
    }
}
```

## Доступные аддоны

- **@storybook/addon-docs** - Автоматическая документация
- **@storybook/addon-a11y** - Проверка доступности
- **@storybook/addon-vitest** - Интеграция с Vitest для тестирования
- **@chromatic-com/storybook** - Визуальное тестирование

## Полезные ссылки

- [Storybook документация](https://storybook.js.org/docs)
- [SASS документация](https://sass-lang.com/documentation)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
