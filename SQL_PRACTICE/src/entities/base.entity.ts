import { db } from "../../db.js"
import { TABLE_METADATA_KEY } from './table.decorator.js';

export interface IBaseEntity {
    id: number;
    createdAt: Date;
    createdBy: number;
    updatedAt: Date;
    updatedBy: number;
}

export abstract class BaseEntity implements IBaseEntity {
    id: number;
    createdAt: Date;
    createdBy: number;
    updatedAt: Date;
    updatedBy: number;

    constructor(entity: IBaseEntity) {
        this.id = entity.id;
        this.createdAt = entity.createdAt;
        this.createdBy = entity.createdBy;
        this.updatedAt = entity.updatedAt;
        this.updatedBy = entity.updatedBy;
    }

    static getTableName(): string {
        return Reflect.getMetadata(TABLE_METADATA_KEY, this) as string;
    }

    
    async save(): Promise<void> {
        const keys = Object.keys(this);
        const columns = keys.join(', ');
        const values = Object.values(this);
        const placeholders = keys.map(() => '?').join(', ');
        const updates = keys.map(k => `${k} = ?`).join(', ');

        const query = `
            INSERT INTO ${(this.constructor as typeof BaseEntity).getTableName()} (${columns}) 
            VALUES (${placeholders})
            ON DUPLICATE KEY UPDATE ${updates}
        `;

        // values twice: once for INSERT, once for UPDATE
        await db.execute(query, [...values, ...values]);
    }

    static async findById<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T,
        id: number
    ): Promise<T | null> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        const query = `SELECT * FROM ${tableName} WHERE id = ?`;
        const [rows] = await db.execute(query, [id]);
        const results = rows as I[];
        if (results.length === 0) return null;
        return new this(results[0]!);
    }

    static async findAll<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T
    ): Promise<T[]> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        const query = `SELECT * FROM ${tableName}`;
        const [rows] = await db.execute(query);
        const results = rows as I[];
        return results.map(row => new this(row));
    }

    static async findOne<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T,
        conditions: Partial<I>
    ): Promise<T | null> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        const keys = Object.keys(conditions);
        const where = keys.map(k => `${k} = ?`).join(' AND ');
        const query = `SELECT * FROM ${tableName} WHERE ${where} LIMIT 1`;
        const [rows] = await db.execute(query, Object.values(conditions));
        const results = rows as I[];
        if (results.length === 0) return null;
        return new this(results[0]!);
    }

    static async deleteById<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T,
        id: number
    ): Promise<void> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        const query = `DELETE FROM ${tableName} WHERE id = ?`;
        await db.execute(query, [id]);
    }

    static async deleteAll<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T
    ): Promise<void> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        await db.execute(`DELETE FROM ${tableName}`);
    }

    static async deleteOne<T extends BaseEntity, I extends IBaseEntity>(
        this: new (entity: I) => T,
        conditions: Partial<I>
    ): Promise<void> {
        const tableName = (this as unknown as typeof BaseEntity).getTableName();
        const keys = Object.keys(conditions);
        const where = keys.map(k => `${k} = ?`).join(' AND ');
        const query = `DELETE FROM ${tableName} WHERE ${where} LIMIT 1`;
        await db.execute(query, Object.values(conditions));
    }
}