import { ApolloServer } from 'apollo-server'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core'
import { context } from './context'
// 1
import { schema } from './schema'
export const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  context
})

const port = 3000
// 2
server.listen({ port }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
