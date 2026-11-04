'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

async function checkAuth() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is not set in environment variables');
  }

  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    throw new Error('Unauthorized');
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = atob(base64Credentials);
    const [, password] = credentials.split(':');

    if (password !== adminPassword) {
      throw new Error('Unauthorized');
    }
  } catch {
    throw new Error('Unauthorized');
  }
}

export async function addMember(formData: FormData) {
  await checkAuth()
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
  await checkAuth()
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
  await checkAuth()
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
  await checkAuth()
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
