/**
 * @param {SpecTrack} event The track event
 * @param {Object.<string, any>} settings Custom settings
 * @return void
 */

 async function getPhone(user_id, space_id, settings) {
	const endpoint = `https://profiles.segment.com/v1/spaces/${space_id}/collections/users/profiles/user_id:${user_id}/traits?include=phone`;
	var credentials = btoa(`${settings.acessTokenPersonasApi}:`);
	let response;

	try {
		response = await fetch(endpoint, {
			method: 'GET',
			headers: {
				Authorization: `Basic ${credentials}`
			}
		});
		let phone = '';
		const data = await response.json();
		if (data.traits) {
			phone = data.traits.phone;
		}
		return { status: true, data: phone };
	} catch (error) {
		return { status: false, error: error.message };
	}
}

async function onTrack(event, settings) {
	const user_id = event.userId;
	const space_id = event.context.personas.space_id;

	const reponsePN = await getPhone(user_id, space_id, settings);

	if (!reponsePN.status) {
		//error....
		throw new RetryError('Response was error');
	}

	const phone = reponsePN.data;
	if (!phone) {
		//Phone number not found
		throw new RetryError('Email not found');
	}

	const Body = 'Ha sido todo un éxito con whatsapp';
	const To = '+57' + phone;

	if (settings.twilioFrom) {
		await sendText(
			{
				From: settings.twilioFrom,
				To,
				Body
			},
			settings
		);
	}

	if (settings.twilioWhatsAppFrom) {
		// Learn more at: https://www.twilio.com/docs/whatsapp
		await sendText(
			{
				To: 'whatsapp:' + To,
				From: 'whatsapp:' + settings.twilioWhatsAppFrom,
				Body
			},
			settings
		);
	}
}

/**
 * Sends SMS or WhatsApp message with Twilio
 *
 * https://www.twilio.com/docs/sms
 * https://www.twilio.com/docs/whatsapp
 *
 */
async function sendText(params, settings) {
	const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountId}/Messages.json`;
	await fetch(endpoint, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(
				settings.twilioAccountId + ':' + settings.twilioToken
			)}`,
			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
		},
		body: toFormParams(params)
	});
}

function toFormParams(params) {
	return Object.entries(params)
		.map(([key, value]) => {
			const paramName = encodeURIComponent(key);
			const param = encodeURIComponent(value);
			return `${paramName}=${param}`;
		})
		.join('&');
}
