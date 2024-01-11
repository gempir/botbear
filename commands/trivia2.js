const { got } = require('./../got');
const tools = require('../tools/tools.js');

module.exports = {
	name: 'trivia2',
	ping: false,
	description: 'This command will start a new trivia in chat, Example: \' bb trivia2 include:"forsen,anime" \' or \' bb trivia2 exclude:"forsen,anime" \' (To see the cooldown on this command, do: "bb check triviacooldown") - Api used: https://gazatu.xyz/ - Categories available: https://gazatu.xyz/trivia/categories',
	permission: 100,
	category: 'Random command',
	execute: async (channel, user, input, perm) => {
		try {
			if (module.exports.permission > perm) {
				return;
			}

			const inputCategories = /(?<=include:")[^"]+(?=")/i.exec(input.join(' '));

			const inputExclude = /(?<=exclude:")[^"]+(?=")/i.exec(input.join(' '));

			let exludeCategories = '';

			if (!inputCategories && !inputExclude) {
				exludeCategories = '[anime,hentai,weeb,d dansgame ta,vorkosigan_saga,dota]'
			} else if (!inputCategories && inputExclude) {
				exludeCategories = `[anime,hentai,weeb,d dansgame ta,vorkosigan_saga,dota,${inputExclude}]`
			} else if (inputCategories && inputExclude) {
				exludeCategories = `[${inputExclude}]`
			}

			const url = `https://api.gazatu.xyz/trivia/questions?count=1&exclude=${encodeURIComponent(exludeCategories)}`
						+ ((inputCategories) ? `&include=${encodeURIComponent(`[${inputCategories}]`)}` : '');

			const questions = await got(url).json();

			const question = decodeURIComponent(questions[0].question);
			let correct_answer = decodeURIComponent(questions[0].answer);
			const hint1 = questions[0].hint1;
			const hint2 = questions[0].hint2;
			const category = decodeURIComponent(questions[0].category);
			correct_answer = tools.removeTrailingStuff(correct_answer);

			return [`(Trivia) [${category}] Question: ${question}`, correct_answer, hint1, hint2];

		} catch (err) {
			console.log(err);
			if (err.name === 'TimeoutError') {
				return `FeelsDankMan api error: ${err.name}`;
			}
			return `FeelsDankMan Error, ${err}`;
		}
	}
};
