// api/planfixContact/route.js

import { NextResponse } from 'next/server';

import { checkIfContactExists, createContact, createTask } from '@/lib/planfixServices';



async function verifyReCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();

  return data.success;
}

// API route for handling Planfix contact and task creation
export async function POST(req) {
  try {
    const { firstName, lastName, email, phone, message, organisation, token } = await req.json();

    // Verify reCAPTCHA token
    const isHuman = await verifyReCaptcha(token);

    if (!isHuman) {
      return NextResponse.json(
        { message: "Failed reCAPTCHA verification" },
        { status: 400 }
      );
    }

    // Server-side validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { message: 'All required fields must be filled out' },
        { status: 400 }
      );
    }

    // Check if the contact exists or create a new one
    let contactId = await checkIfContactExists(email);

    if (!contactId) {
      contactId = await createContact(firstName, lastName, email, phone, organisation);
    }

    // Create task assigned to this contact
    await createTask(contactId, message, organisation);

    // Return success response
    return NextResponse.json({ message: 'Task created successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error creating task or contact:', error.message);

    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
