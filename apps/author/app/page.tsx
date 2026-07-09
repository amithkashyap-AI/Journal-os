import { redirect } from "next/navigation";
import { getToken } from "../lib/api";

export default async function HomePage() {
  const token = await getToken();
  redirect(token ? "/dashboard" : "/login");
}
