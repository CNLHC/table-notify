import * as XLSX from "xlsx";
import moment, { Moment } from "moment";
import { v4 } from "uuid";
import { ErrNoBlob } from "./errors";
import { GetRedisCli } from "./redis";


export type TDataRow = {
    id: string
    school: string
    name: string
    raw_date: string
    is_checked: string
    is_out_school: string
    new_date: Moment
}

export function extract_data_from_xlsx(book: XLSX.WorkBook) {
    const res = [] as Array<TDataRow>
    Object.entries(book.Sheets).forEach(([e, s]) => {
        const js = XLSX.utils.sheet_to_csv(s, {})
        const day = moment(e, 'MM月DD日')
        const data = js.split('\n')
            .slice(1)
            .map(e => e.split(','))
            .map(e => ({
                id: e[0],
                school: e[1],
                name: e[2],
                raw_date: e[3],
                is_checked: e[4],
                is_out_school: e[5],
                new_date: moment(e[3], 'MM/DD/YY'),
            } as TDataRow))
            .filter(e => day.isSame(e.new_date, 'day'))

        res.push(...data)
    })
    return res
}

export function check_should_send(row: TDataRow) {
    const is_last_day = (str: Moment) => moment().diff(str, 'days') == 1
    if (
        is_last_day(row.new_date)
        && (row.is_checked.trim().length == 0 || row.is_checked.trim() == '否')
        && row.is_out_school.trim().length == 0
    ) {
        return true
    }
    return false
}

export function do_check(book: XLSX.WorkBook) {

    // get book

    const data = extract_data_from_xlsx(book)
    return data.filter(check_should_send)

}

export async function register_blob(blob: Buffer) {
    const id = v4()
    const rds = await GetRedisCli()
    await rds.SETEX(id, 3600, blob.toString('base64'))
    return id
}



export async function get_blob_or_fail(id: string) {
    const rds = await GetRedisCli()
    const res = await rds.GET(id)
    if (!res) throw ErrNoBlob
    return Buffer.from(res, 'base64')
}
