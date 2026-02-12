/**
 * Format Converters - JSON to XML, CSV, YAML
 * All conversions happen client-side for maximum security
 */

import { parseJson } from './jsonFormatter';

type JsonValue = string | number | boolean | null | JsonObject | Array<JsonValue>;
interface JsonObject { [key: string]: JsonValue; }

/**
 * Convert JSON to XML format
 * @param json - JSON object or string
 * @returns XML string
 */
export function jsonToXml(json: JsonValue | string): string {
    const obj = typeof json === 'string' ? parseJson(json) : json;

    if (!obj) {
        throw new Error('Invalid JSON input');
    }

    function convertToXml(data: JsonValue): string {
        let xml = '';

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                xml += `  <item index="${index}">\n`;
                xml += convertToXml(item).split('\n').map(line => '    ' + line).join('\n');
                xml += '\n  </item>\n';
            });
        } else if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');

                if (Array.isArray(value)) {
                    xml += `  <${sanitizedKey}>\n`;
                    value.forEach((item, index) => {
                        xml += `    <item index="${index}">\n`;
                        xml += convertToXml(item).split('\n').map(line => '      ' + line).join('\n');
                        xml += '\n    </item>\n';
                    });
                    xml += `  </${sanitizedKey}>\n`;
                } else if (typeof value === 'object' && value !== null) {
                    xml += `  <${sanitizedKey}>\n`;
                    xml += convertToXml(value).split('\n').map(line => '    ' + line).join('\n');
                    xml += `\n  </${sanitizedKey}>\n`;
                } else {
                    const escapedValue = escapeXml(String(value));
                    xml += `  <${sanitizedKey}>${escapedValue}</${sanitizedKey}>\n`;
                }
            });
        } else {
            return escapeXml(String(data));
        }

        return xml;
    }

    const xmlContent = convertToXml(obj);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${xmlContent}</root>`;
}

/**
 * Convert JSON to CSV format
 * @param json - JSON object or string (must be array or object)
 * @returns CSV string
 */
export function jsonToCsv(json: JsonValue | string): string {
    const obj = typeof json === 'string' ? parseJson(json) : json;

    if (!obj) {
        throw new Error('Invalid JSON input');
    }

    // Handle array of objects
    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return '';
        }

        // Get all unique keys
        const keys = Array.from(
            new Set(obj.flatMap(item => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    return Object.keys(item);
                }
                return [];
            }))
        );

        // Create header row
        const header = keys.map(key => escapeCsv(key)).join(',');

        // Create data rows
        const rows = obj.map(item => {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                return keys.map(() => '').join(',');
            }
            return keys.map(key => {
                const value = (item as JsonObject)[key];
                if (value === null || value === undefined) {
                    return '';
                }
                if (typeof value === 'object') {
                    return escapeCsv(JSON.stringify(value));
                }
                return escapeCsv(String(value));
            }).join(',');
        });

        return [header, ...rows].join('\n');
    }

    // Handle single object
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        const header = keys.map(key => escapeCsv(key)).join(',');
        const values = keys.map(key => {
            const value = (obj as JsonObject)[key];
            if (value === null || value === undefined) {
                return '';
            }
            if (typeof value === 'object') {
                return escapeCsv(JSON.stringify(value));
            }
            return escapeCsv(String(value));
        }).join(',');

        return `${header}\n${values}`;
    }

    throw new Error('JSON must be an object or array for CSV conversion');
}

/**
 * Convert JSON to YAML format
 * @param json - JSON object or string
 * @returns YAML string
 */
export function jsonToYaml(json: JsonValue | string): string {
    const obj = typeof json === 'string' ? parseJson(json) : json;

    if (!obj) {
        throw new Error('Invalid JSON input');
    }

    function convertToYaml(data: JsonValue, indent: number = 0): string {
        const spaces = '  '.repeat(indent);
        let yaml = '';

        if (Array.isArray(data)) {
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    yaml += `${spaces}-\n`;
                    yaml += convertToYaml(item, indent + 1);
                } else {
                    yaml += `${spaces}- ${formatYamlValue(item)}\n`;
                }
            });
        } else if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    yaml += `${spaces}${key}:\n`;
                    yaml += convertToYaml(value, indent + 1);
                } else if (typeof value === 'object' && value !== null) {
                    yaml += `${spaces}${key}:\n`;
                    yaml += convertToYaml(value, indent + 1);
                } else {
                    yaml += `${spaces}${key}: ${formatYamlValue(value)}\n`;
                }
            });
        } else {
            return `${spaces}${formatYamlValue(data)}\n`;
        }

        return yaml;
    }

    return convertToYaml(obj);
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Escape CSV values
 */
function escapeCsv(str: string): string {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

/**
 * Format value for YAML output
 */
function formatYamlValue(value: JsonValue): string {
    if (value === null) return 'null';
    if (value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
        // Quote strings that contain special characters
        if (value.includes(':') || value.includes('#') || value.includes('\n')) {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
    }
    return String(value);
}
