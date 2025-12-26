import { ProfileCard } from "@/shared";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ProfileCard />
      <a href="/auth/logout" className="button logout">
        Log Out
      </a>
    </div>
  );
}
