// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */

 async function getEmail(user_id, space_id, settings) {
	const endpoint = `https://profiles.segment.com/v1/spaces/${space_id}/collections/users/profiles/user_id:${user_id}/traits?include=email`;
	var credentials = btoa(`${settings.acessTokenPersonasApi}:`);
	let response;

	try {
		response = await fetch(endpoint, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${credentials}`
			}
		});
		let email = '';
		const data = await response.json();
		if (data.traits) {
			email = data.traits.email;
		}
		return { status: true, data: email };
	} catch (error) {
		return { status: false, error: error.message };
	}
}

async function onTrack(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/track/
	//1. Obtenemos el número de celular
	const user_id = event.userId;
	const space_id = event.context.personas.space_id;

	const reponsePN = await getEmail(user_id, space_id, settings);

	if (!reponsePN.status) {
		//error....
		throw new RetryError('Response was error');
	}

	const email = reponsePN.data;
	if (!email) {
		//Phone number not found
		throw new RetryError('Email not found');
	}

	const endpoint = 'https://api.sendgrid.com/v3/mail/send'; // replace with your endpoint
	let response;

	try {
		response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${settings.sendGridToken}`,
				'Content-Type': 'application/json'
			},
			body: `{
    "personalizations": [
        {
            "to": [
                {
                    "email": "${email}"
                }
            ]
        }
    ],
    "from": {
        "email": "${settings.sendGridFromEmail}"
    },
    "subject": "Ha sido todo un éxito!",
    "content": [
        {
            "type": "text/plain",
            "value": "Heya!"
        }
    ]
}`
		});
	} catch (error) {
		// Retry on connection error
		throw new RetryError(error.message);
	}

	if (response.status >= 500 || response.status === 429) {
		// Retry on 5xx (server errors) and 429s (rate limits)
		throw new RetryError(`Failed with ${response.status}`);
	}
}
