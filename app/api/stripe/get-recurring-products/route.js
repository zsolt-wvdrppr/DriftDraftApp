import { NextResponse } from "next/server";

import { fetchRecurringProducts } from "@/lib/utils/stripeUtils";

export async function GET() {
  try {
    const products = await fetchRecurringProducts();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
