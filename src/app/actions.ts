'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData): Promise<void> {
  try {
    const name = formData.get('name') as string
    if (!name || typeof name !== 'string' || name.length > 100) return;

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Failed to add member', error)
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId)) return { error: 'Invalid memberId' }
    if (typeof meetingName !== 'string' || meetingName.length > 100) return { error: 'Invalid meetingName' }

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
  } catch (error) {
    console.error('Failed to record attendance', error)
    return { error: 'Failed to record attendance' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId)) return { error: 'Invalid memberId' }
    if (typeof amount !== 'number' || isNaN(amount) || amount < -10000 || amount > 10000) return { error: 'Invalid amount' }
    if (typeof reason !== 'string' || !reason || reason.length > 100) return { error: 'Invalid reason' }

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
  } catch (error) {
    console.error('Failed to add bonus points', error)
    return { error: 'Failed to add bonus points' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId)) return { error: 'Invalid memberId' }

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
  } catch (error) {
    console.error('Failed to delete member', error)
    return { error: 'Failed to delete member' }
  }
}
