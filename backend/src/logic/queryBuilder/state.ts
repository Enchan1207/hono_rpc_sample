type State = {
  id: number
  name: string
}

interface Query {
  setId(id: number): this
  setName(name: string): this
}

interface InternalQuery extends Query { internal(): void }

const builder = (state: State): InternalQuery => ({
  setId(id: number) {
    const newState: State = {
      ...state,
      id,
    }
    return builder(newState)
  },

  setName(name: string) {
    const newState: State = {
      ...state,
      name,
    }
    return builder(newState)
  },

  internal() {
    console.log(state.id, state.name)
  },
})

const makeQuery = (initialState: State): Query => builder(initialState)

const state = {
  id: 3,
  name: 'test',
}
const query = makeQuery(state).setId(4).setName('test2').setId(1)

;(query as InternalQuery).internal()
console.log(state)
