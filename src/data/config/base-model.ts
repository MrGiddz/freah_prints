import fs from "fs";
import path from "path";
import { encryptData, decryptData } from "./encryption";
import { v4 } from "uuid";
import logger from "../../utils/logger";

export type Document<T> = T & {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Abstract Base class for handling CRUD operations on encrypted JSON files.
 * This class provides a reusable model for securely managing data.
 *
 * @template T - Type of the data being stored
 */
export abstract class Base<T extends { id?: string; [key: string]: any }> {
  private filePath: string;
  private index: Map<string, T>; // Index for quick lookups
  private uniqueFields: string[];
  private fileName: string;

  /**
   * Initializes a new instance of the Base class.
   * @param filename - The name of the file to store the data.
   * @param uniqueFields - Fields that must be unique across records.
   */
  constructor(filename: string, uniqueFields: string[] = []) {
    this.filePath = path.join(__dirname, `../db/${filename}.json`);
    this.index = new Map();
    this.fileName = filename
    this.uniqueFields = uniqueFields;
    this.ensureFileExists();
    this.buildIndex();
  }

  /**
   * Builds an index for efficient lookups.
   */
  private buildIndex(): void {
    this.index.clear();
    const records = this.readData();
    for (const record of records) {
      const indexKey = this.generateIndexKey(record);
      this.index.set(indexKey, record);
    }
  }

  /**
   * Generates a unique key for indexing records.
   */
  private generateIndexKey(data: T): string {
    return Object.keys(data)
      .sort()
      .map((key) => `${key}:${data[key]}`)
      .join("_");
  }

  /**
   * Ensures that the storage file exists, creating it if necessary.
   */
  private ensureFileExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, encryptData([]), "utf-8");
    }
  }

  /**
   * Reads and decrypts data from the file.
   * @returns An array of stored records.
   */
  private readData(): T[] {
    try {
      const encryptedData = fs.readFileSync(this.filePath, "utf-8");
      return decryptData(encryptedData);
    } catch (error) {
      logger.error(`Error reading from ${this.filePath}:`, error);
      return [];
    }
  }

  /**
   * Encrypts and writes data to the file.
   * @param data - The records to store.
   */
  private writeData(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, encryptData(data), "utf-8");
    } catch (error) {
      logger.error(`Error writing to ${this.filePath}:`, error);
    }
  }

  /**
   * Creates a new record and stores it.
   * @param data - The new record to add.
   * @returns A Promise resolving to the created record.
   */
  public create(data: T): Promise<Document<T>> {
    return new Promise((resolve, reject) => {

      const violationMessage = this.isUniqueViolation(data);

      if (violationMessage) {
        logger.error(`Error: ${violationMessage}`);
        return reject(violationMessage);
      }

      const records = this.readData();
      const timestamp = new Date().toISOString();
      const newRecord: Document<T> = {
        id: this.generateUniqueId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...data,
      };
      records.push(newRecord);
      this.writeData(records);
      console.log({newRecord})
      resolve(newRecord);
    });
  }

  /**
   * Finds a record by its unique ID.
   * @param id - The ID of the record to find.
   * @returns A Promise resolving to the matching record or undefined if not found.
   */
  public findById(id: string): Promise<Document<T> | undefined> {
    return new Promise((resolve) => {
      const record = this.readData().find((item) => item.id === id);
      resolve(record);
    });
  }

  /**
   * Generates a unique UUID for records.
   */
  private generateUniqueId(): string {
    return v4();
  }

  /**
   * Finds a single record that matches the given criteria.
   * @param condition - Key-value pairs representing search criteria.
   * @returns A Promise resolving to the first matching record or undefined if not found.
   */
  public findOne(condition: Partial<T>): Promise<Document<T> | undefined> {
    return new Promise((resolve) => {
      const record = this.readData().find((item) =>
        Object.keys(condition).every((key) => item[key] === condition[key])
      );
      resolve(record);
    });
  }

  /**
   * Retrieves all stored records.
   * @returns A Promise resolving to an array of all stored records.
   */
  public find(): Promise<Document<T>[]> {
    return new Promise((resolve) => {
      resolve(this.readData());
    });
  }

  /**
   * Checks if unique field constraints are violated and logs details.
   */
  private isUniqueViolation(data: T): string | null {
    if (this.uniqueFields.length === 0) return null;
    const records = this.readData();

    for (const record of records) {
      for (const field of this.uniqueFields) {
        if (record[field] === data[field]) {
          return `Unique constraint violated on '${this.fileName}' and on field '${field}' with value '${data[field]}'`;
        }
      }
    }
    return null;
  }

  /**
   * Updates a record that matches the given condition.
   * @param condition - Criteria to find the record.
   * @param updateData - Data to update.
   * @returns A Promise resolving to a boolean indicating success or failure.
   */
  public update(
    condition: Partial<T>,
    updateData: Partial<T>
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let records = this.readData();

      const index = records.findIndex((item) =>
        Object.keys(condition).every((key) => item[key] === condition[key])
      );

      if (index !== -1) {
        const existingRecord = records[index];

        // Merge the updates while preserving the original unique identifier
        const updatedRecord = {
          ...existingRecord,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        // Ignore uniqueness check for the same record being updated
        const violationMessage = this.isUniqueViolation(updatedRecord);
        if (violationMessage && existingRecord.code !== updatedRecord.code) {
          logger.error(`Error: ${violationMessage}`);
          return reject(violationMessage);
        }

        records[index] = updatedRecord;
        this.writeData(records);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Deletes records that match the given condition.
   * @param condition - Criteria to match records for deletion.
   * @returns A boolean indicating whether records were deleted.
   */
  public delete(condition: Partial<T>): boolean {
    let records = this.readData();
    const newRecords = records.filter(
      (item) =>
        !Object.keys(condition).every((key) => item[key] === condition[key])
    );

    if (newRecords.length !== records.length) {
      this.writeData(newRecords);
      return true;
    }
    return false;
  }
}
