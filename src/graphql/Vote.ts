import { User } from '@prisma/client'
import { objectType, extendType, nonNull, intArg } from 'nexus'

export const Vote = objectType({ // 1
  name: 'Vote',
  definition (t) {
    t.nonNull.field('link', { type: 'Link' })
    t.nonNull.field('user', { type: 'User' })
  }
})

export const VoteMutation = extendType({ // 2
  type: 'Mutation',
  definition (t) {
    t.field('vote', {
      type: 'Vote',
      args: {
        linkId: nonNull(intArg())
      },
      async resolve (parent, { linkId }, { userId, prisma }) {
        if (!userId) {
          throw new Error('You must be logged in to vote!')
        }

        const link = await prisma.link.update({
          where: {
            id: linkId
          },
          data: {
            voters: {
              connect: {
                id: userId
              }
            }
          }
        })

        const user = await prisma.user.findUnique({
          where: {
            id: userId
          }
        })

        return {
          link,
          user: user as User
        }
      }
    })
  }
})
