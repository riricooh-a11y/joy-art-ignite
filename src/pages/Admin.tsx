import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Admin as AdminView, loadDB } from "@/lib/certpy";

export default function Admin() {
  const [db, setDb] = useState(loadDB);
  const nav = useNavigate();
  return <AdminView db={db} setDb={setDb} onBack={() => nav("/")} />;
}