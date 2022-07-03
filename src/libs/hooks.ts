import axios, { Axios, AxiosError } from "axios";
import Router from "next/router";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocalStorage } from "react-use";
import { ErrNoBlob } from "./errors";
import { useTypedSelector } from "./state";
import { ActSetGlobalState } from "./state/global";
import { TDataRow } from "./thu";

export function useAuth() {
    const [token, setToken] = useLocalStorage<string>("NOTIFY_TABLE_TOKEN", undefined)
    const [rpc_token, setRPCToken] = useLocalStorage<string>("NOTIFY_TABLE_WPS_RPC_TOKEN", undefined)

    useEffect(() => {
        if (token === undefined)
            Router.push('/login')
    }, [token])
    return { token, setToken, setRPCToken, rpc_token }
}
export function useAuthCheck() {
    const { cli } = useClient()
    useEffect(() => {

        cli.get('/api/check')
        const fn = (url: string) => {
            if ('/login' !== url)
                cli.get('/api/check')
        }
        Router.events.on("routeChangeStart", fn)
        return () => Router.events.off("routeChangeStart", fn)
    }, [cli])
}
export function useClient() {
    const { token, setToken } = useAuth()

    return {
        cli: useMemo(() => {
            const cli = axios.create({
                headers: {
                    authorization: token ?? ""
                }
            });
            cli.interceptors.response.use(e => e, (e: AxiosError<any>) => {
                if (e.response?.status == 403 || e.response?.status == 401) {
                    setToken(undefined)
                    Router.push('/login')
                    return
                }
                throw e
            })
            return cli
        }, [token])
    }
}
export function useRPCToken() {

    const { cli } = useClient()
    return {
        get_rpc_token: useCallback(() => {
            return cli.get<{ rpc_token: string }>('/api/wps/rpc_token').then(e => e.data)
        }, [cli])
    }
}

export type SessionInfo = {
    all: Array<TDataRow>, should_notify: Array<TDataRow>

}
export function useSession() {
    const dispatch = useDispatch()
    const { cli } = useClient()
    return {
        session: useTypedSelector(e => e.GlobalReducer.session),
        set_session: useCallback((session?: string) => {
            dispatch(ActSetGlobalState({ session }))
        }, [dispatch]),
        get_session: useCallback((session?: string) => {
            if (session)
                return cli.get<SessionInfo>('/api/table', { params: { session } })
                    .then(e => e.data)
                    .catch((e) => {
                        if (e instanceof AxiosError) {
                            if (e.response?.data.msg === ErrNoBlob.message) {
                            }
                        }
                        dispatch(ActSetGlobalState({ session: undefined }))
                        throw e
                    })
            return undefined
        }, [dispatch, cli])
    }
}
