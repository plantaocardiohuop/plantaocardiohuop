'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

async function requireAuth() {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) throw new Error('Server configuration error');
  const authHeader = (await headers()).get('authorization');
  if (!authHeader) throw new Error('Unauthorized');
  const auth = atob(authHeader.split(' ')[1]).split(':');
  if (auth[0] !== 'admin' || auth[1] !== pwd) throw new Error('Unauthorized');
}

export async function addMember(formData: FormData) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
