import { NextResponse } from "next/server";

import { fetchOneOffProducts } from "@/lib/utils/stripeUtils"; // Use the utility function

export async function GET() {
  try {
    const products = await fetchOneOffProducts();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
