'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name') as string

    // Security: Input validation
    if (!name || typeof name !== 'string' || name.length > 255) {
      return { error: 'Invalid name provided' }
    }

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (_error) {
    // Security: Don't leak internal errors/stack traces
    return { error: 'Failed to add member' }
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    // Security: Input validation
    if (!memberId || !Number.isInteger(memberId) || memberId <= 0) {
      return { error: 'Invalid member ID' }
    }

    if (typeof meetingName !== 'string' || meetingName.length > 255) {
      return { error: 'Invalid meeting name' }
    }

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
    return { success: true }
  } catch (_error) {
    // Security: Don't leak internal errors/stack traces
    return { error: 'Failed to record attendance' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    // Security: Input validation
    if (!memberId || !Number.isInteger(memberId) || memberId <= 0) {
      return { error: 'Invalid member ID' }
    }

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < -10000 || amount > 10000) {
      return { error: 'Invalid amount' }
    }

    if (!reason || typeof reason !== 'string' || reason.length > 255) {
      return { error: 'Invalid reason' }
    }

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
    return { success: true }
  } catch (_error) {
    // Security: Don't leak internal errors/stack traces
    return { error: 'Failed to add bonus points' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    // Security: Input validation
    if (!memberId || !Number.isInteger(memberId) || memberId <= 0) {
      return { error: 'Invalid member ID' }
    }

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
    return { success: true }
  } catch (_error) {
    // Security: Don't leak internal errors/stack traces
    return { error: 'Failed to delete member' }
  }
}
