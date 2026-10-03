import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function Home() {
  const members = await prisma.member.findMany({
    orderBy: {
      points: 'desc'
    },
    include: {
      transactions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ranking Rotary</h1>
          <Link href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Administração
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {members.length === 0 ? (
              <li className="p-6 text-center text-gray-500">
                Nenhum membro cadastrado ainda.
              </li>
            ) : (
              members.map((member, index) => (
                <li key={member.id} className="p-6 flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800 font-bold text-lg">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {member.transactions.length > 0 ? (
                        <span>Última pontuação: {member.transactions[0].reason} (+{member.transactions[0].amount})</span>
                      ) : (
                        <span>Sem pontuações recentes</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-2xl font-bold text-green-600">{member.points}</span>
                    <span className="text-sm text-gray-500 ml-1">pts</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  )
}
