import { NextResponse } from 'next/server';

export async function POST(request) {
    const data = await request.json();
    // Replace with actual logic to store data in Strapi or another backend
    console.log("Received data:", data);
    return NextResponse.json({ success: true });
}
