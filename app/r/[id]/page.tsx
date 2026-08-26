import { redirect } from "next/navigation";
import { getRaffleByIdAsync } from "@/lib/db";

export default async function ShortRaffleRedirectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const raffle = await getRaffleByIdAsync(id);
  
  if (raffle) {
    redirect(`/raffle/${raffle.slug || raffle.id}`);
  } else {
    redirect(`/#active-raffles`);
  }
}

