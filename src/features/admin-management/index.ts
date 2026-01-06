export * from "./api";
export * from "./model";

// 頻繁に使用される関数と型の再エクスポート（entities からの便宜エクスポート）
export {
  getAllSkills,
  getAllOccupations,
  type Skill,
  type Occupation,
} from "@/entities";
