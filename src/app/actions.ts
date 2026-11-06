'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { headers } from 'next/headers'

async function checkAuth() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  if (!authHeader) throw new Error('Unauthorized');

  const authValue = authHeader.split(' ')[1];
  if (!authValue) throw new Error('Unauthorized');

  let decoded = '';
  try {
    decoded = atob(authValue);
  } catch {
    throw new Error('Unauthorized');
  }
  const [, password] = decoded.split(':');

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || password !== expectedPassword) {
    throw new Error('Unauthorized');
  }
}

const prisma = new PrismaClient()

export async function addMember(formData: FormData) {
  await checkAuth();
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
  await checkAuth();
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
  await checkAuth();
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
  await checkAuth();
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
