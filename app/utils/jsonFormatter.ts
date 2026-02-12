/**
 * JSON Formatter Utilities
 * All processing happens client-side - no data leaves the browser
 */

type JsonValue = string | number | boolean | null | JsonObject | Array<JsonValue>;
interface JsonObject { [key: string]: JsonValue; }

export interface FormatResult {
    formatted: string;
    error?: string;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
    line?: number;
    column?: number;
}

/**
 * Format JSON with proper indentation
 * @param input - Raw JSON string
 * @param spaces - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON or error
 */
export function formatJson(input: string, spaces: number = 2): FormatResult {
    try {
        if (!input.trim()) {
            return { formatted: '', error: 'Input is empty' };
        }

        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, spaces);
        return { formatted };
    } catch (error) {
        return {
            formatted: '',
            error: error instanceof Error ? error.message : 'Invalid JSON'
        };
    }
}

/**
 * Validate JSON and provide detailed error information
 * @param input - JSON string to validate
 * @returns Validation result with error details
 */
export function validateJson(input: string): ValidationResult {
    try {
        if (!input.trim()) {
            return { valid: false, error: 'Input is empty' };
        }

        JSON.parse(input);
        return { valid: true };
    } catch (error) {
        if (error instanceof SyntaxError) {
            // Extract line and column from error message
            const match = error.message.match(/position (\d+)/);
            const position = match ? parseInt(match[1]) : 0;

            // Calculate line and column
            const lines = input.substring(0, position).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;

            return {
                valid: false,
                error: error.message,
                line,
                column
            };
        }

        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid JSON'
        };
    }
}

/**
 * Minify JSON by removing whitespace
 * @param input - JSON string to minify
 * @returns Minified JSON or error
 */
export function minifyJson(input: string): FormatResult {
    try {
        if (!input.trim()) {
            return { formatted: '', error: 'Input is empty' };
        }

        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        return { formatted: minified };
    } catch (error) {
        return {
            formatted: '',
            error: error instanceof Error ? error.message : 'Invalid JSON'
        };
    }
}

/**
 * Parse JSON safely
 * @param input - JSON string
 * @returns Parsed object or null
 */
export function parseJson(input: string): JsonValue | null {
    try {
        return JSON.parse(input) as JsonValue;
    } catch {
        return null;
    }
}

/**
 * Escape special characters for JSON
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeJson(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

/**
 * Unescape JSON special characters
 * @param str - String to unescape
 * @returns Unescaped string
 */
export function unescapeJson(str: string): string {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
}

/**
 * Get JSON statistics
 * @param input - JSON string
 * @returns Object with statistics
 */
export function getJsonStats(input: string): {
    size: number;
    lines: number;
    characters: number;
    valid: boolean;
} {
    const lines = input.split('\n').length;
    const characters = input.length;
    const size = new Blob([input]).size;
    const valid = validateJson(input).valid;

    return { size, lines, characters, valid };
}
