'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name')
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return { error: 'Invalid name provided' }
    }

    await prisma.member.create({
      data: {
        name: name.trim(),
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { error: 'Failed to add member' }
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId) || memberId <= 0) {
      return { error: 'Invalid member ID' }
    }

    if (typeof meetingName !== 'string' || meetingName.length > 255) {
      return { error: 'Invalid meeting name' }
    }

    const points = 10;

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount: points,
          reason: `Presença: ${meetingName.trim()}`,
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
  } catch {
    return { error: 'Failed to record attendance' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId) || memberId <= 0) {
      return { error: 'Invalid member ID' }
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0 || amount > 10000 || amount < -10000) {
      return { error: 'Invalid point amount' }
    }
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 255) {
      return { error: 'Invalid reason' }
    }

    await prisma.$transaction([
      prisma.pointTransaction.create({
        data: {
          memberId,
          amount,
          reason: reason.trim(),
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
  } catch {
    return { error: 'Failed to add bonus points' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId) || memberId <= 0) {
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
  } catch {
    return { error: 'Failed to delete member' }
  }
}