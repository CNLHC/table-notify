import "reflect-metadata"
import { Column, Entity, Index, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import type { Relation } from 'typeorm'

import { DataSource } from "typeorm"
import { config } from "dotenv";
config()


export type BaseTokenInfo = {
    access_token?: string,
    refresh_token?: string,
    expire_at?: string
}

export type TokenStore = {
    wps_token?: BaseTokenInfo

}

@Entity()
export class UserModel {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    name: string

    @Column('jsonb')
    external_id: any


    @Column('jsonb')
    token_store: TokenStore
}

@Entity()
export class EndpointUserModel {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    nature_key: string

    @Column()
    name: string

    @Column()
    phone_number: string

    @Column({
        nullable: true
    })
    last_notify: Date

    @OneToMany(() => NotificationLog, t => t.user)
    logs: Relation<NotificationLog[]>
}


@Entity()
export class NotificationLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: "sms_send" | "sms_error"

    @Column()
    created_at: Date

    @Column('jsonb', { default: () => `'{}'::jsonb` })
    context: any

    @ManyToOne(e => EndpointUserModel, (t) => t.logs, { eager: true })
    user: EndpointUserModel

}



let datasource = new DataSource({
    type: "postgres",
    name: "default",
    host: process.env["PG_HOST"],
    port: parseInt(process.env["PG_PORT"] ?? "5432"),
    database: process.env["PG_DB"],
    username: process.env["PG_USER"],
    password: process.env["PG_PW"],
    connectTimeoutMS: 3000,
    schema: "tablenotify",
    maxQueryExecutionTime: 2000,
    entities: [UserModel, EndpointUserModel, NotificationLog],
    synchronize: true,
    logging: "all",
    uuidExtension: 'uuid-ossp',
    logNotifications: true,
    poolErrorHandler: (e) => console.error(e)
})


export async function getDatasource() {
    if (!datasource.isInitialized) {
        datasource = await datasource.initialize()
    }
    return datasource
}

export async function getManager() {
    return getDatasource().then(e => e.createEntityManager())
}

