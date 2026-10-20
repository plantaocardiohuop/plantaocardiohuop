'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  try {
    const name = formData.get('name')
    if (typeof name !== 'string' || !name.trim() || name.length > 100) return

    await prisma.member.create({
      data: {
        name: name.trim(),
        points: 0,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
  } catch {
    console.error('Operation failed: secure error boundary caught exception')
  }
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) return
    if (typeof meetingName !== 'string' || meetingName.length > 100) return

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
  } catch {
    console.error('Operation failed: secure error boundary caught exception')
  }
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) return
    if (!Number.isInteger(amount) || Math.abs(amount) > 10000) return
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 100) return

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
  } catch {
    console.error('Operation failed: secure error boundary caught exception')
  }
}

export async function deleteMember(memberId: number) {
  try {
    if (!Number.isInteger(memberId) || memberId <= 0) return

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
    console.error('Operation failed: secure error boundary caught exception')
  }
}
