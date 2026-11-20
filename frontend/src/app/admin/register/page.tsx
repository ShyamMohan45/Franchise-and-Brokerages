import { redirect } from "next/navigation";

export default function AdminRegisterPage() {
  redirect("/register?role=admin");
}
