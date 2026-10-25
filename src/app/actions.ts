'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name')
    if (typeof name !== 'string' || !name || name.length > 100) return { error: 'Invalid input' }
    await prisma.member.create({ data: { name, points: 0 } })
    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'Operation failed' }
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (typeof memberId !== 'number' || typeof meetingName !== 'string' || meetingName.length > 100) return { error: 'Invalid input' }
    const points = 10;
    await prisma.$transaction([
      prisma.pointTransaction.create({ data: { memberId, amount: points, reason: `Presença: ${meetingName}` } }),
      prisma.member.update({ where: { id: memberId }, data: { points: { increment: points } } })
    ]);
    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'Operation failed' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (typeof memberId !== 'number' || typeof amount !== 'number' || typeof reason !== 'string' || reason.length > 100 || amount > 10000 || amount < -10000 || !amount || !reason) return { error: 'Invalid input' }
    await prisma.$transaction([
      prisma.pointTransaction.create({ data: { memberId, amount, reason } }),
      prisma.member.update({ where: { id: memberId }, data: { points: { increment: amount } } })
    ]);
    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'Operation failed' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (typeof memberId !== 'number') return { error: 'Invalid input' }
    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({ where: { memberId } }),
      prisma.member.delete({ where: { id: memberId } })
    ]);
    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'Operation failed' }
  }
}
