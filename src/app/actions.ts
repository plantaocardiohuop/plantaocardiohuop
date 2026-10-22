'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name') as string
    if (!name || name.length > 255) return { error: 'Invalid name' }

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'An error occurred while adding the member' }
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' }
    if (meetingName && meetingName.length > 255) return { error: 'Meeting name too long' }

    const points = 10; // 10 points for attending a meeting

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount: points,
          reason: `Presença: ${meetingName}`,
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { points: { increment: points } }
      })
    ]);

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'An error occurred while recording attendance' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' }
    if (!amount || isNaN(amount) || amount <= 0 || amount > 1000000) return { error: 'Invalid amount' }
    if (!reason || reason.length > 255) return { error: 'Invalid reason' };

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount,
          reason,
        }
      }),
      prisma.member.update({
        where: { id: memberId },
        data: { points: { increment: amount } }
      })
    ]);

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'An error occurred while adding bonus points' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (!memberId || isNaN(memberId)) return { error: 'Invalid member ID' }

    await prisma.$transaction([
      prisma.pointTransaction.deleteMany({
        where: { memberId }
      }),
      prisma.member.delete({
        where: { id: memberId }
      })
    ]);

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    return { error: 'An error occurred while deleting the member' }
  }
}
