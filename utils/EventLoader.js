const fs = require('node:fs');
const { Events } = require('discord.js');
const ReadFolder = require('./ReadFolder.js');

module.exports = function (client) {
	if (!fs.existsSync(`${__dirname}/../events/`)) return;

	const files = ReadFolder('events');
	for (const { path, data } of files) {
		if (typeof data.name !== 'string') {
			console.log(`Could not load ${path} : Missing name`);
			continue;
		}

		if (Events[data.name]) data.name = Events[data.name];

		if (!Events[data.name] && !Object.values(Events).includes(data.name)) {
			console.log(`Invalid event name "${data.name}" - Unknown to Discord.JS`);
		}
			
		if (typeof data.execute !== 'function') {
			console.log(`Could not load ${path} : Missing an execute function`);
			continue;
		}

		client[data.once ? 'once' : 'on'](data.name, data.execute.bind(null, client));
	}
	
	console.log(`Loaded ${files.length} events!`);
}
