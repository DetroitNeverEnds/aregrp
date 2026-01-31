# Доработка компонента Button

## Текущий статус
- **Соответствие дизайну:** 90%
- **Статус:** ✅ Реализован, требует доработок

## Что уже реализовано

### ✅ Варианты (variants)
- `primary` - основная кнопка
- `secondary` - вторичная кнопка
- `outline` - кнопка с обводкой
- `ghost` - прозрачная кнопка

### ✅ Размеры (sizes)
- `sm` - маленькая (32px высота)
- `md` - средняя (40px высота)
- `lg` - большая (48px высота)

### ✅ Состояния
- `default` - обычное состояние
- `hover` - при наведении
- `active` - при нажатии
- `disabled` - неактивная кнопка
- `loading` - состояние загрузки

### ✅ Дополнительные возможности
- Поддержка иконок (слева и справа)
- Полная ширина (`fullWidth`)
- Состояние загрузки со спиннером

---

## Что нужно доработать

### 1. Добавить недостающие варианты кнопок

#### 1.1 Вариант `link`
**Описание:** Кнопка, стилизованная как ссылка

**Дизайн из Figma:**
- Нет фона
- Цвет текста: `primary.600` (#48768F)
- При hover: `primary.700` (#375A6D)
- При active: `primary.800` (#263E4B)
- Подчеркивание при hover

**Задача:**
```typescript
// Добавить в Button.tsx
variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
```

**Стили в Button.module.scss:**
```scss
.link {
    background: transparent;
    color: var(--primary-600);
    padding: 0;
    border: none;
    text-decoration: none;
    
    &:hover:not(:disabled) {
        color: var(--primary-700);
        text-decoration: underline;
    }
    
    &:active:not(:disabled) {
        color: var(--primary-800);
    }
}
```

#### 1.2 Вариант `danger`
**Описание:** Кнопка для опасных действий (удаление, отмена)

**Дизайн из Figma:**
- Фон: `error.default` (#E53740)
- При hover: `error.hover` (#CB3A3A)
- При active: `error.active` (#A73030)
- Цвет текста: белый

**Задача:**
```typescript
variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
```

**Стили:**
```scss
.danger {
    background-color: var(--error-default);
    color: var(--gray-0);
    
    &:hover:not(:disabled) {
        background-color: var(--error-hover);
    }
    
    &:active:not(:disabled) {
        background-color: var(--error-active);
    }
}
```

---

### 2. Исправить размеры padding

**Проблема:** Текущие padding не полностью соответствуют дизайну

**Из Figma:**
- `sm`: padding `8px 12px` (сейчас `6px 12px`)
- `md`: padding `10px 16px` (сейчас `8px 16px`)
- `lg`: padding `12px 20px` (сейчас `10px 20px`)

**Задача:** Обновить в `Button.module.scss`:
```scss
.sm {
    padding: 8px 12px;  // было 6px 12px
    height: 32px;
}

.md {
    padding: 10px 16px;  // было 8px 16px
    height: 40px;
}

.lg {
    padding: 12px 20px;  // было 10px 20px
    height: 48px;
}
```

---

### 3. Добавить состояние `focus`

**Проблема:** Отсутствует визуальное состояние фокуса для доступности

**Из Figma:**
- Обводка: `2px solid primary.500` (#5D91AD)
- Отступ от кнопки: `2px` (outline-offset)

**Задача:** Добавить в `Button.module.scss`:
```scss
.button {
    // ... существующие стили
    
    &:focus-visible {
        outline: 2px solid var(--primary-500);
        outline-offset: 2px;
    }
}
```

---

### 4. Улучшить состояние `loading`

**Проблема:** Спиннер не соответствует размеру кнопки

**Из Figma:**
- `sm`: спиннер 16px
- `md`: спиннер 20px
- `lg`: спиннер 24px

**Текущая реализация:** Всегда 20px

**Задача:** Обновить `Button.tsx`:
```typescript
const spinnerSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

{loading && (
    <Spinner 
        size={spinnerSize} 
        className={styles.spinner} 
    />
)}
```

---

### 5. Добавить поддержку badge

**Описание:** Бейдж с числом (например, количество уведомлений)

**Из Figma:**
- Круглый бейдж справа от текста
- Размер: 20px × 20px
- Фон: `error.default` (#E53740)
- Цвет текста: белый
- Шрифт: 12px, weight 600

**Задача:** Добавить в `Button.tsx`:
```typescript
interface ButtonProps {
    // ... существующие пропсы
    badge?: number;
}

// В JSX:
{badge && badge > 0 && (
    <span className={styles.badge}>
        {badge > 99 ? '99+' : badge}
    </span>
)}
```

**Стили:**
```scss
.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    margin-left: 8px;
    background-color: var(--error-default);
    color: var(--gray-0);
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
}
```

---

### 6. Добавить группу кнопок (ButtonGroup)

**Описание:** Компонент для группировки нескольких кнопок

**Из Figma:**
- Кнопки без отступов между собой
- Первая кнопка: скругление слева
- Последняя кнопка: скругление справа
- Средние кнопки: без скругления

**Задача:** Создать новый компонент `ButtonGroup.tsx`:
```typescript
interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ 
    children, 
    className 
}) => {
    return (
        <div className={cn(styles.buttonGroup, className)}>
            {children}
        </div>
    );
};
```

**Стили `ButtonGroup.module.scss`:**
```scss
.buttonGroup {
    display: inline-flex;
    
    .button {
        border-radius: 0;
        
        &:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
        }
        
        &:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        
        &:not(:last-child) {
            border-right: 1px solid var(--gray-20);
        }
    }
}
```

---

### 7. Добавить адаптивность

**Проблема:** Кнопки не адаптируются под мобильные устройства

**Из Figma:**
- На мобильных: кнопки могут быть `fullWidth`
- Размер `lg` на десктопе = `md` на мобильном

**Задача:** Добавить в `Button.module.scss`:
```scss
@media (max-width: 768px) {
    .lg {
        padding: 10px 16px;
        height: 40px;
        font-size: 14px;
    }
    
    .button {
        &.fullWidth {
            width: 100%;
        }
    }
}
```

---

### 8. Улучшить типизацию

**Проблема:** Недостаточно строгая типизация для иконок

**Задача:** Обновить `Button.tsx`:
```typescript
import { IconName } from '../Icon/iconConfig';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: IconName;
    rightIcon?: IconName;
    badge?: number;
    children: React.ReactNode;
}
```

---

### 9. Добавить тесты

**Задача:** Создать тесты в `Button.test.tsx`:

```typescript
describe('Button', () => {
    // Существующие тесты...
    
    it('renders link variant correctly', () => {
        render(<Button variant="link">Link Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('link');
    });
    
    it('renders danger variant correctly', () => {
        render(<Button variant="danger">Delete</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('danger');
    });
    
    it('renders badge when provided', () => {
        render(<Button badge={5}>Notifications</Button>);
        expect(screen.getByText('5')).toBeInTheDocument();
    });
    
    it('renders 99+ for badge over 99', () => {
        render(<Button badge={150}>Notifications</Button>);
        expect(screen.getByText('99+')).toBeInTheDocument();
    });
    
    it('shows correct spinner size for each button size', () => {
        const { rerender } = render(
            <Button size="sm" loading>Small</Button>
        );
        // Проверить размер спиннера 16px
        
        rerender(<Button size="md" loading>Medium</Button>);
        // Проверить размер спиннера 20px
        
        rerender(<Button size="lg" loading>Large</Button>);
        // Проверить размер спиннера 24px
    });
});
```

---

### 10. Обновить Storybook

**Задача:** Добавить новые варианты в `Button.stories.tsx`:

```typescript
export const LinkVariant: Story = {
    args: {
        variant: 'link',
        children: 'Link Button',
    },
};

export const DangerVariant: Story = {
    args: {
        variant: 'danger',
        children: 'Delete',
    },
};

export const WithBadge: Story = {
    args: {
        children: 'Notifications',
        badge: 5,
    },
};

export const ButtonGroupExample: Story = {
    render: () => (
        <ButtonGroup>
            <Button>First</Button>
            <Button>Second</Button>
            <Button>Third</Button>
        </ButtonGroup>
    ),
};

export const Responsive: Story = {
    args: {
        children: 'Responsive Button',
        fullWidth: true,
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
};
```

---

## Чек-лист задач

- [ ] Добавить вариант `link`
- [ ] Добавить вариант `danger`
- [ ] Исправить padding для всех размеров
- [ ] Добавить состояние `focus`
- [ ] Исправить размеры спиннера в состоянии `loading`
- [ ] Добавить поддержку `badge`
- [ ] Создать компонент `ButtonGroup`
- [ ] Добавить адаптивность для мобильных
- [ ] Улучшить типизацию
- [ ] Добавить тесты для новых функций
- [ ] Обновить Storybook с новыми примерами
- [ ] Обновить документацию компонента

---

## Оценка трудозатрат

| Задача | Сложность | Время |
|--------|-----------|-------|
| Варианты link и danger | Низкая | 1 час |
| Исправление padding | Низкая | 0.5 часа |
| Состояние focus | Низкая | 0.5 часа |
| Размеры спиннера | Низкая | 0.5 часа |
| Поддержка badge | Средняя | 1.5 часа |
| ButtonGroup | Средняя | 2 часа |
| Адаптивность | Низкая | 1 час |
| Типизация | Низкая | 0.5 часа |
| Тесты | Средняя | 2 часа |
| Storybook | Низкая | 1 час |
| **Итого** | | **10.5 часов** |

**Примерно 1.5 рабочих дня для одного разработчика.**

---

## Приоритеты

### Высокий приоритет (критично)
1. Исправление padding (влияет на все кнопки)
2. Состояние focus (доступность)
3. Вариант danger (часто используется)

### Средний приоритет (важно)
4. Размеры спиннера (визуальная согласованность)
5. Адаптивность (мобильная версия)
6. Тесты (качество кода)

### Низкий приоритет (желательно)
7. Вариант link (можно использовать компонент Link)
8. Badge (редко используется)
9. ButtonGroup (специфичный случай)
10. Обновление Storybook (документация)