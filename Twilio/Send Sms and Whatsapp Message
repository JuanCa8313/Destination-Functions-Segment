/**
 * @param {SpecTrack} event The track event
 * @param {Object.<string, any>} settings Custom settings
 * @return void
 */
async function onTrack(event, settings) {
	const Body = 'Ha sido todo un éxito';
	const To = '+57' + event.properties.phoneNumber;

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
