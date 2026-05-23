import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landing as LandingView, loadDB } from "@/lib/certpy";

export default function Landing() {
  const [db] = useState(loadDB);
  const nav = useNavigate();
  return <LandingView db={db} onAdmin={() => nav("/admin")} onDemo={() => nav("/demo")} />;
}