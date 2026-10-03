'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  const name = formData.get('name') as string
  if (!name) return

  await prisma.member.create({
    data: {
      name,
      points: 0,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function recordAttendance(memberId: number, meetingName: string = "Reunião do Rotary") {
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
}

export async function addBonusPoints(memberId: number, amount: number, reason: string) {
  if (!amount || !reason) return;

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
}

export async function deleteMember(memberId: number) {
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
}
