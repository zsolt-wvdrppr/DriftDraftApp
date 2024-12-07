import { NextResponse } from 'next/server';

import logger from '@/lib/logger';

export async function POST(request) {
    const data = await request.json();

    // Replace with actual logic to store data in Strapi or another backend
    logger.info("Received data:", data);

    return NextResponse.json({ success: true });
}
