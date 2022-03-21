import { extendType, nonNull, objectType, stringArg, intArg, inputObjectType, enumType, arg, list } from 'nexus'
import { Prisma } from '@prisma/client'
// import { NexusGenObjects } from '../../nexus-typegen'

export const Link = objectType({
  name: 'Link',
  definition (t) {
    t.nonNull.int('id')
    t.nonNull.string('description')
    t.nonNull.string('url')
    t.nonNull.dateTime('createdAt')
    t.field('postedBy', {
      type: 'User',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.link.findUnique({
          where: {
            id: parent.id
          }
        }).postedBy()
      }
    })
    t.nonNull.list.nonNull.field('voters', {
      type: 'User',
      resolve: ({ id }, _, ctx) => {
        return ctx.prisma.link.findUnique({
          where: {
            id
          }
        }).voters()
      }
    })
  }
})

// const links: NexusGenObjects['Link'][] = [ // 1
//   {
//     id: 1,
//     url: 'www.howtographql.com',
//     description: 'Fullstack tutorial for GraphQL'
//   },
//   {
//     id: 2,
//     url: 'graphql.org',
//     description: 'GraphQL official website'
//   }
// ]

export const LinkQuery = extendType({
  type: 'Query',
  definition (t) {
    t.nonNull.field('feed', { // 1
      type: 'Feed',
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) })
      },
      async resolve (parent, args, context) {
        const where = args.filter
          ? {
              OR: [
                { description: { contains: args.filter } },
                { url: { contains: args.filter } }
              ]
            }
          : {}

        const [links, count] = await Promise.all([
          context.prisma.link.findMany({
            where,
            skip: args?.skip as number | undefined,
            take: args?.take as number | undefined,
            orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined
          }),
          context.prisma.link.count({ where })
        ])

        return { // 3
          links,
          count
        }
      }
    })
  }
})
export const linkMutation = extendType({
  type: 'Mutation',
  definition (t) {
    // post
    t.nonNull.field('post', { // 2
      type: 'Link',
      args: { // 3
        description: nonNull(stringArg()),
        url: nonNull(stringArg())
      },

      resolve (parent, args, context) {
        const { description, url } = args // 4
        const { userId } = context // 5

        if (!userId) { // 1
          throw new Error('Cannot post without logging in.')
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: {
              connect: {
                id: userId
              }
            }
          }
        })
        return newLink
      }
    })

    // Update
    t.nonNull.field('update', { // 2
      type: 'Link',
      args: { // 3
        id: nonNull(intArg()),
        description: stringArg(),
        url: stringArg()
      },

      resolve (parent, args, context) {
        const { description, url, id } = args // 4

        const linkUpdated = context.prisma.link.update({
          where: {
            id
          },
          data: {
            description: description || undefined,
            url: url || undefined
          }
        })
        return linkUpdated
      }
    })

    // Delete
    t.field('delete', { // 2
      type: 'Link',
      args: { // 3
        id: nonNull(intArg())
      },

      resolve (parent, args, context) {
        const { id } = args // 4

        const linkDeleted = context.prisma.link.delete({
          where: {
            id
          }
        })

        return linkDeleted
      }
    })
  }
})

export const LinkOrderByInput = inputObjectType({
  name: 'LinkOrderByInput',
  definition (t) {
    t.field('description', { type: Sort })
    t.field('url', { type: Sort })
    t.field('createdAt', { type: Sort })
  }
})

export const Sort = enumType({
  name: 'Sort',
  members: ['asc', 'desc']
})

export const Feed = objectType({
  name: 'Feed',
  definition (t) {
    t.nonNull.list.nonNull.field('links', { type: Link }) // 1
    t.nonNull.int('count') // 2
  }
})
