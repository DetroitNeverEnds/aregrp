/**
 * Скрипт для поиска неиспользуемых ключей переводов
 *
 * Сканирует исходный код и находит:
 * - Ключи переводов, которые определены, но не используются
 * - Ключи, которые используются в коде, но не определены
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SRC_DIR = path.join(__dirname, '../src');
const LANGUAGES = ['ru', 'en'];

interface TranslationObject {
    [key: string]: string | TranslationObject;
}

/**
 * Рекурсивно получает все ключи из объекта переводов
 */
function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Загружает файл переводов для указанного языка
 */
function loadTranslation(language: string): TranslationObject {
    const filePath = path.join(LOCALES_DIR, language, 'translation.json');

    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл переводов не найден: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Рекурсивно получает все файлы с указанными расширениями
 */
function getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        // Пропускаем директории node_modules, dist, build и локали
        if (item.isDirectory()) {
            if (!['node_modules', 'dist', 'build', 'locales', '.git'].includes(item.name)) {
                files.push(...getAllFiles(fullPath, extensions));
            }
        } else if (item.isFile()) {
            const ext = path.extname(item.name);
            if (extensions.includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

/**
 * Находит все использования ключей переводов в файле
 */
function findTranslationKeysInFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys: string[] = [];

    // Паттерны для поиска использования переводов:
    // t('key'), t("key"), t(`key`)
    // i18n.t('key'), i18n.t("key"), i18n.t(`key`)
    const patterns = [/\bt\s*\(\s*['"`]([^'"`]+)['"`]/g, /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            keys.push(match[1]);
        }
    }

    return keys;
}

/**
 * Основная функция поиска неиспользуемых переводов
 */
function findUnusedTranslations(): void {
    console.log('🔍 Поиск неиспользуемых ключей переводов...\n');

    // Загружаем все ключи из базового языка (ru)
    const translations = loadTranslation('ru');
    const allDefinedKeys = new Set(getAllKeys(translations));

    console.log(`📋 Всего ключей в ru: ${allDefinedKeys.size}\n`);

    // Сканируем все исходные файлы
    const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx', '.js', '.jsx']);
    console.log(`📁 Найдено файлов для сканирования: ${sourceFiles.length}\n`);

    const usedKeys = new Set<string>();

    for (const file of sourceFiles) {
        const keys = findTranslationKeysInFile(file);
        keys.forEach(key => usedKeys.add(key));
    }

    console.log(`✓ Найдено использованных ключей: ${usedKeys.size}\n`);

    // Находим неиспользуемые ключи
    const unusedKeys = [...allDefinedKeys].filter(key => !usedKeys.has(key));

    // Находим ключи, которые используются, но не определены
    const undefinedKeys = [...usedKeys].filter(key => !allDefinedKeys.has(key));

    // Выводим результаты
    console.log('═══════════════════════════════════════\n');

    if (unusedKeys.length > 0) {
        console.log(`⚠️  Неиспользуемые ключи (${unusedKeys.length}):`);
        unusedKeys.sort().forEach(key => {
            console.log(`   - ${key}`);
        });
        console.log('');
    } else {
        console.log('✅ Все определённые ключи используются\n');
    }

    if (undefinedKeys.length > 0) {
        console.log(`❌ Используемые, но не определённые ключи (${undefinedKeys.length}):`);
        undefinedKeys.sort().forEach(key => {
            console.log(`   - ${key}`);
        });
        console.log('');
    } else {
        console.log('✅ Все используемые ключи определены\n');
    }

    console.log('═══════════════════════════════════════\n');

    // Статистика
    const usagePercent = ((usedKeys.size / allDefinedKeys.size) * 100).toFixed(1);
    console.log(`📊 Статистика:`);
    console.log(`   Определено ключей: ${allDefinedKeys.size}`);
    console.log(`   Используется: ${usedKeys.size} (${usagePercent}%)`);
    console.log(`   Не используется: ${unusedKeys.length}`);
    console.log(`   Не определено: ${undefinedKeys.length}\n`);

    if (undefinedKeys.length > 0) {
        process.exit(1);
    }
}

// Запуск поиска
findUnusedTranslations();
