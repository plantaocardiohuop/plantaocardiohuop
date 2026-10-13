'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name')
    if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
      console.error('Invalid name provided')
      return
    }

    await prisma.member.create({
      data: {
        name: name.trim(),
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
    if (typeof memberId !== 'number' || isNaN(memberId)) {
      console.error('Invalid member ID')
      return
    }
    if (typeof meetingName !== 'string' || meetingName.length > 200) {
      console.error('Invalid meeting name')
      return
    }

    const points = 10; // 10 points for attending a meeting

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
  } catch (error) {
    console.error('Failed to record attendance', error)
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId)) {
      console.error('Invalid member ID')
      return
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > 10000) {
      console.error('Invalid amount')
      return
    }
    if (typeof reason !== 'string' || !reason || reason.length > 200) {
      console.error('Invalid reason')
      return
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
  } catch (error) {
    console.error('Failed to add bonus points', error)
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (typeof memberId !== 'number' || isNaN(memberId)) {
      console.error('Invalid member ID')
      return
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
    console.error('Failed to delete member', error)
  }
}
