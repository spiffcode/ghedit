/**
 * Represents a UUID as defined by rfc4122.
 */
export interface UUID {
    /**
     * @returns the canonical representation in sets of hexadecimal numbers separated by dashes.
     */
    asHex(): string;
    equals(other: UUID): boolean;
}
/**
 * An empty UUID that contains only zeros.
 */
export declare var empty: UUID;
export declare function v4(): UUID;
/**
 * Parses a UUID that is of the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
 * @param value A uuid string.
 */
export declare function parse(value: string): UUID;
export declare function generateUuid(): string;
