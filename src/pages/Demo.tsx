import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DemoApp, loadDB } from "@/lib/certpy";

export default function Demo() {
  const [db] = useState(loadDB);
  const nav = useNavigate();
  return <DemoApp db={db} onBack={() => nav("/")} />;
}