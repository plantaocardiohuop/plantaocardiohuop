'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name')

    if (!name || typeof name !== 'string' || name.length > 255) {
      console.error('Invalid input for addMember')
      return { error: 'Invalid input' }
    }

    await prisma.member.create({
      data: {
        name,
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
  } catch (error) {
    console.error('Operation failed', error)
    return { error: 'An error occurred' }
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) {
      console.error('Invalid memberId for recordAttendance')
      return { error: 'Invalid input' }
    }

    if (typeof meetingName !== 'string' || meetingName.length > 255) {
      console.error('Invalid meetingName for recordAttendance')
      return { error: 'Invalid input' }
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
  } catch (error) {
    console.error('Operation failed', error)
    return { error: 'An error occurred' }
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) {
      console.error('Invalid memberId for addBonusPoints')
      return { error: 'Invalid input' }
    }

    if (!Number.isInteger(amount) || amount <= 0 || amount > 10000) {
      console.error('Invalid amount for addBonusPoints')
      return { error: 'Invalid input' }
    }

    if (!reason || typeof reason !== 'string' || reason.length > 255) {
      console.error('Invalid reason for addBonusPoints')
      return { error: 'Invalid input' }
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
  } catch (error) {
    console.error('Operation failed', error)
    return { error: 'An error occurred' }
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) {
      console.error('Invalid memberId for deleteMember')
      return { error: 'Invalid input' }
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
  } catch (error) {
    console.error('Operation failed', error)
    return { error: 'An error occurred' }
  }
}
