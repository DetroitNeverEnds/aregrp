import React from 'react';
import styles from './Card.module.scss';

export interface CardProps {
    /** Заголовок карточки */
    title: string;
    /** Описание карточки */
    description?: string;
    /** URL изображения */
    imageUrl?: string;
    /** Вариант отображения */
    variant?: 'default' | 'outlined' | 'elevated';
    /** Обработчик клика */
    onClick?: () => void;
    /** Дополнительные дочерние элементы */
    children?: React.ReactNode;
}

/**
 * Компонент Card для отображения контента в виде карточки
 */
export const Card = ({
    title,
    description,
    imageUrl,
    variant = 'default',
    onClick,
    children,
}: CardProps) => {
    const cardClasses = [
        styles.card,
        styles[`card--${variant}`],
        onClick ? styles['card--clickable'] : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={cardClasses} onClick={onClick}>
            {imageUrl && (
                <div className={styles.card__image}>
                    <img src={imageUrl} alt={title} />
                </div>
            )}
            <div className={styles.card__content}>
                <h3 className={styles.card__title}>{title}</h3>
                {description && <p className={styles.card__description}>{description}</p>}
                {children && <div className={styles.card__body}>{children}</div>}
            </div>
        </div>
    );
};
