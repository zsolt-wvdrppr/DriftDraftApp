const PLANFIX_API_URL = process.env.PLANFIX_API_URL;
const PLANFIX_API_TOKEN = process.env.PLANFIX_API_TOKEN;

// Helper function to check if contact exists in Planfix
export async function checkIfContactExists(email) {
  //console.log("checking contact existence for email=", email);
  const response = await fetch(`${PLANFIX_API_URL}/contact/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLANFIX_API_TOKEN}`,
    },
    body: JSON.stringify({
      "offset": 0,
      "pageSize": 100,
      "fields": ["id, email"],
      "filters": [
        {
          "type": "4026",
          "operator": "equal",
          "value": email
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to check contact existence');
  }

  const data = await response.json();
  //console.log("data=", data);
  
  return data.contacts && data.contacts.length > 0 ? data.contacts[0].id : null;
}

// Helper function to create a new contact in Planfix
export async function createContact(firstName, lastName, email, phone, organisation) {
  const response = await fetch(`${PLANFIX_API_URL}/contact/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLANFIX_API_TOKEN}`,
    },
    body: JSON.stringify({
      "template": {
        "id": 1 // ID of the Contact template
      },
      "name": firstName,
      "lastname": lastName,
      "email": email,
      "description": "From: Website Enquiry<br /><br />" + "Unverified Organisation: " + organisation,
      "phones": [
        {
          "number": phone,
          "type": 1
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create contact');
  }


  const data = await response.json();
  //console.log("contact created, id=", data);

  if (!data || !data.id) {
    throw new Error("Planfix API did not return a valid task object");
  }

  return data.id;
}

// Helper function to create a new task
export async function createTask(contactId, message, organisation) {
  //console.log("creating task for contactId=", contactId);
  const response = await fetch(`${PLANFIX_API_URL}/task/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PLANFIX_API_TOKEN}`,
    },
    body: JSON.stringify({
      "name": 'Website Enquiry',
      "description": `Organisation: ${organisation}<br /><br />${message}`,
      "template": {
        "id": 79 // ID of the Request template
      },
      "assigner": {
        "id": "contact:"+ contactId,
      },
      "assignees": {
        "groups": [
          {
            "id": 9189 // ID of the Customer Support group
          }
        ]
      }
      , 
    }),
  });

  if (!response.ok) {
    //console.log("response=", response);
    throw new Error('Failed to create task');
  }

  const data = await response.json();
  //console.log("data=", data);

  // Check if the task object exists in the response
  if (!data || !data.id) {
    throw new Error("Planfix API did not return a valid task object");
  }

  //console.log("task created, id=", data.id);
  return data.id;
}
