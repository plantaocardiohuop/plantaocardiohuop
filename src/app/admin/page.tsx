import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { addMember, recordAttendance, addBonusPoints, deleteMember } from '../actions'

const prisma = new PrismaClient()

export default async function Admin() {
  const members = await prisma.member.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">
            Voltar ao Ranking
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Add Member Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Adicionar Membro</h2>
            <form action={addMember} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                <input type="text" name="name" id="name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Adicionar
              </button>
            </form>
          </div>

          {/* Record Attendance Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Registrar Presença</h2>
            <form action={async (formData) => {
              'use server'
              const memberId = parseInt(formData.get('memberId') as string)
              const meetingName = formData.get('meetingName') as string || "Reunião do Rotary"
              if (memberId) await recordAttendance(memberId, meetingName)
            }} className="space-y-4">
              <div>
                <label htmlFor="memberId" className="block text-sm font-medium text-gray-700">Membro</label>
                <select name="memberId" id="memberId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                  <option value="">Selecione...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="meetingName" className="block text-sm font-medium text-gray-700">Nome da Reunião (opcional)</label>
                <input type="text" name="meetingName" id="meetingName" placeholder="Reunião do Rotary" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Registrar (+10 pts)
              </button>
            </form>
          </div>

          {/* Add Bonus Points Form */}
          <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Atribuir Pontos Extra</h2>
            <form action={async (formData) => {
              'use server'
              const memberId = parseInt(formData.get('memberId') as string)
              const amount = parseInt(formData.get('amount') as string)
              const reason = formData.get('reason') as string
              if (memberId && amount && reason) await addBonusPoints(memberId, amount, reason)
            }} className="space-y-4 md:grid md:grid-cols-4 md:gap-4 md:space-y-0">
              <div className="md:col-span-1">
                <label htmlFor="bonusMemberId" className="block text-sm font-medium text-gray-700">Membro</label>
                <select name="memberId" id="bonusMemberId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                  <option value="">Selecione...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Pontos</label>
                <input type="number" name="amount" id="amount" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motivo</label>
                <input type="text" name="reason" id="reason" required placeholder="Ex: Doação" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
              </div>
              <div className="md:col-span-1 flex items-end">
                <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mb-1">
                  Atribuir
                </button>
              </div>
            </form>
          </div>

          {/* Member List for deletion */}
           <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
             <h2 className="text-xl font-bold mb-4 text-gray-900">Gerenciar Membros</h2>
             <ul className="divide-y divide-gray-200">
              {members.map(m => (
                <li key={m.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-900">{m.name} ({m.points} pts)</span>
                  <form action={async () => {
                    'use server'
                    await deleteMember(m.id)
                  }}>
                    <button type="submit" className="text-red-600 hover:text-red-900 text-sm">Remover</button>
                  </form>
                </li>
              ))}
              {members.length === 0 && <li className="text-gray-500 py-2">Nenhum membro</li>}
             </ul>
           </div>
        </div>
      </div>
    </main>
  )
}
