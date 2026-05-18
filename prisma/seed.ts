/// <reference types="node" />
import prismaPkg from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { seedDatabase } from './seedData'

const { PrismaClient } = prismaPkg

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({ adapter })

async function main() {
  await seedDatabase(prisma)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
