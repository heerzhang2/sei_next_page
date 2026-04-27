/**
 * 获取部门科室和人员列表 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/divisions?divisionId=xxx
 * 获取指定部门下的科室和人员列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get('divisionId');

    if (!divisionId) {
      return NextResponse.json(
        { success: false, error: 'Missing divisionId parameter' },
        { status: 400 }
      );
    }

    // 获取部门信息
    const division = await prisma.division.findUnique({
      where: { id: BigInt(divisionId) },
      select: { id: true, name: true },
    });

    if (!division) {
      return NextResponse.json(
        { success: false, error: 'Division not found' },
        { status: 404 }
      );
    }

    // 获取科室列表（offices）
    const offices = await prisma.office.findMany({
      where: { 
        division_id: BigInt(divisionId),
        cancel: false 
      },
      select: { 
        id: true, 
        name: true,
        shortname: true,
      },
      orderBy: { name: 'asc' },
    });

    // 获取部门下所有人员（包括无所属科室的）
    const users = await prisma.uSERS.findMany({
      where: {
        dep_id: BigInt(divisionId),
        ENABLED: true,
      },
      select: {
        id: true,
        USERNAME: true,
        authName: true,
        person: {
          select: {
            id: true,
            name: true,
          },
        },
        office: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { USERNAME: 'asc' },
    });

    // 按科室分组人员
    const officeUsers = offices.map(office => ({
      ...office,
      id: office.id.toString(),
      users: users
        .filter(u => u.office?.id === office.id)
        .map(u => ({
          id: u.id.toString(),
          username: u.USERNAME,
          authName: u.authName,
          personName: u.person?.name,
          personId: u.person?.id.toString(),
        })),
    }));

    // 无所属科室的人员
    const noOfficeUsers = users
      .filter(u => !u.office)
      .map(u => ({
        id: u.id.toString(),
        username: u.USERNAME,
        authName: u.authName,
        personName: u.person?.name,
        personId: u.person?.id.toString(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        division: {
          id: division.id.toString(),
          name: division.name,
        },
        offices: officeUsers,
        noOfficeUsers,
      },
    });

  } catch (error: any) {
    console.error('[DivisionsAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
