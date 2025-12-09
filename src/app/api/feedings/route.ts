import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 100;
    const tag = searchParams.get("tag");

    let query: any = {
      where: { userId: session.user.id },
      include: { tags: true },
      orderBy: { startedAt: "desc" },
      take: limit,
    };

    if (tag) {
      query.where.tags = {
        some: { tag },
      };
    }

    const feedings = await prisma.feeding.findMany(query);

    return NextResponse.json(feedings);
  } catch (error) {
    console.error("Error fetching feedings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { side, startedAt, endedAt, notes, tags } = body;

    if (!side || !startedAt || !endedAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const durationSeconds = Math.floor(
      (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
    );

    const feeding = await prisma.feeding.create({
      data: {
        userId: session.user.id,
        side,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        durationSeconds,
        notes: notes || null,
        tags: tags
          ? {
              create: tags.map((tag: string) => ({ tag })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(feeding, { status: 201 });
  } catch (error) {
    console.error("Error creating feeding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
