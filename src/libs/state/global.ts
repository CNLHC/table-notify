
import { produce } from 'immer'
import { Reducer } from 'redux'

export const CDN_SESSION_KEY = 'CDN_SESSION_TOKEN'
export type LangCode = 'zh' | 'en'

export type TState = {
    session?: string
}

const initState: TState = {
}

const ActNameSetState = '[Global]SetState'

export const ActSetGlobalState = (state: Partial<TState>) => ({
    type: ActNameSetState as typeof ActNameSetState,
    state,
})

export type TAction = ReturnType<typeof ActSetGlobalState>

export const GlobalReducer: Reducer<TState, TAction> = (
    state = initState,
    action
) =>
    produce(state, (draft) => {
        switch (action.type) {
            case ActNameSetState:
                return { ...draft, ...action.state }
        }
        return draft
    })
