import { redirect } from "next/dist/server/api-utils";
import  Experiance  from "./components/Experiance";

export default function Home() {
  return (
    <main className="h-dvh w-dvw">
     <Experiance/>
    </main>
  );
}
