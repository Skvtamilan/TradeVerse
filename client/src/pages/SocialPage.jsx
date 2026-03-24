import FriendsPanel from "../components/Social/FriendsPanel";
import Leaderboard  from "../components/Leaderboard/Leaderboard";

export default function SocialPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>Social</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Add friends, chat, and compete on the leaderboard</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        <FriendsPanel />
        <Leaderboard />
      </div>
    </div>
  );
}
