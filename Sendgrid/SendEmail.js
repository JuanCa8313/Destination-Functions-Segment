// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/track/
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
                    "email": "${event.properties.email}"
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
