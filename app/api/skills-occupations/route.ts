import { NextResponse } from "next/server";
import { getAllSkills } from "@/entities/skill/api";
import { getAllOccupations } from "@/entities/occupation/api";

export async function GET() {
  try {
    const [skills, occupations] = await Promise.all([
      getAllSkills(),
      getAllOccupations(),
    ]);

    return NextResponse.json({
      skills,
      occupations,
    });
  } catch (error) {
    console.error("Failed to fetch skills and occupations:", error);
    return NextResponse.json(
      { error: "スキル・職種データの取得に失敗しました" },
      { status: 500 },
    );
  }
}
