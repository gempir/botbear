require('dotenv').config();
const tools = require('../tools/tools.js');
let messageHandler = require('../tools/messageHandler.js').messageHandler;
const got = require('got');
const cc = require('../bot.js').cc;
const _ = require('underscore');
const sql = require('./../sql/index.js');

module.exports = {
	name: 'channel',
	ping: true,
	description: '"bb channel join/leave" the bot joins or leaves your channel(only works in hottestbear/botbear1110 chats). "bb channel [live/offline/title/game]emote *emote*" this changes the notify emotes. "bb channel trivia *seconds*" this changes the trivia cooldown(Default is 300s, if cd is too low, it can bug out)',
	permission: 100,
	category: 'Core command',
	execute: async (channel, user, input, perm) => {
		try {
			if (module.exports.permission > perm) {
				return;
			}
			let modresponse = false;

			if (input[3] && (input[2] === 'join' || input[2] === 'leave')) {
				let modcheck = await got(`https://api.ivr.fi/twitch/modsvips/${input[3]}`, { timeout: 10000 }).json();
				let ismod = modcheck['mods'];
				await _.each(ismod, async function (modstatus) {
					if (modstatus.login == user.username) {
						modresponse = true;
					}
				});
			}
			Promise.all([modresponse]);
			switch (input[2]) {
			case 'join': {
				if (channel !== process.env.TWITCH_USER && channel !== process.env.TWITCH_OWNERNAME && perm < 2000) { return; }
				let username = user.username;
				let uid = user['user-id'];

				if (input[3] && user['user-id'] != process.env.TWITCH_OWNERUID && !modresponse) {
					if (input[3].toLowerCase() !== username) {
						return 'You can only make me join your own channel, or a channel you are mod in.';
					}
				}

				if (input[3]) {
					let streamer = await got(`https://api.ivr.fi/twitch/resolve/${input[3]}`, { timeout: 10000 }).json();
					uid = streamer.id;
					username = input[3];
				}

				const alreadyJoined = await sql.Query(`
                SELECT *
                FROM Streamers
                WHERE username=?`,
				[username]);

				if (alreadyJoined.length) {
					return 'I am already in your channel :)';
				}

				else {
					await tools.joinChannel({username, uid});

					return cc.join(username)
						.then(() => {
							new messageHandler(`#${username}`, `👋 nymnDank Hello! I am botbear1110, I was added to the channel by @${user.username}. Here is a list my commands: https://hotbear.org/`, true).newMessage();
							return `Joined channel: ${username}`;
						})
						.catch((err) => {
							console.log(err);
							return 'Error joining channel ask @hottestbear for help.';
						});

				}
			}
			case 'leave': {
				let username = user.username;
				let uid = user['user-id'];
				if (channel != 'botbear1110' && channel != 'hottestbear' && channel != user.username && perm < 2000) { return; }
				if (input[3]) {
					let streamer = await got(`https://api.ivr.fi/twitch/resolve/${input[3]}`, { timeout: 10000 }).json();
					uid = streamer.id;
					username = input[3];
				}

				if (input[3] && user['user-id'] != process.env.TWITCH_OWNERUID && !modresponse) {
					if (input[3].toLowerCase() !== user.username) {
						return 'You can only make me leave your own channel, or a channel you are mod in.';
					}
				}

				const alreadyJoined = await sql.Query(`
                            SELECT *
                            FROM Streamers
                            WHERE username =? `,
				[username]);

				if (!alreadyJoined.length) {
					return 'I am not in your channel';
				}

				else {
					await sql.Query('DELETE FROM Streamers WHERE username=?', [username]);
					await tools.deleteEventSub(uid);

					cc.part(username).catch((err) => {
						console.log(err);
					});
					new messageHandler(`#${username}`, '👋 nymnDank bye!', true).newMessage();

					return `Left channel: ${username} `;
				}
			}
			case 'liveemote': {
				let username = user.username;
				if (channel != 'botbear1110' && channel != 'hottestbear' && perm < 2000 && !tools.isMod(user, channel)) { return; }
				if (!input[3]) {
					return;
				}

				if (tools.isMod(user, channel) || perm >= 2000) {
					username = channel;
				}


				const alreadyJoined = await sql.Query(`
                    SELECT *
                        FROM Streamers
                            WHERE username =? `,
				[username]);

				if (!alreadyJoined.length) {
					return 'I am not in your channel';
				}

				else {
					await sql.Query('UPDATE Streamers SET liveemote =? WHERE username =? ', [input[3], username]);
					return `Live emote is now set to ${input[3]} `;
				}
			}
			case 'gameemote': {
				let username = user.username;
				if (channel != 'botbear1110' && channel != 'hottestbear' && perm < 2000 && !tools.isMod(user, channel)) { return; }
				if (!input[3]) {
					return;
				}

				if (tools.isMod(user, channel) || perm >= 2000) {
					username = channel;
				}


				const alreadyJoined = await sql.Query(`
                    SELECT *
                        FROM Streamers
                            WHERE username =? `,
				[username]);

				if (!alreadyJoined.length) {
					return 'I am not in your channel';
				}

				else {
					await sql.Query('UPDATE Streamers SET gameemote =? WHERE username =? ', [input[3], username]);
					return `Game emote is now set to ${input[3]} `;
				}
			}
			case 'titleemote': {
				let username = user.username;
				if (channel != 'botbear1110' && channel != 'hottestbear' && perm < 2000 && !tools.isMod(user, channel)) { return; }
				if (!input[3]) {
					return;
				}

				if (tools.isMod(user, channel) || perm >= 2000) {
					username = channel;
				}


				const alreadyJoined = await sql.Query(`
                    SELECT *
                        FROM Streamers
                            WHERE username =? `,
				[username]);

				if (!alreadyJoined.length) {
					return 'I am not in your channel';
				}

				else {
					await sql.Query('UPDATE Streamers SET titleemote =? WHERE username =? ', [input[3], username]);
					return `Title emote is now set to ${input[3]} `;
				}
			}
			case 'offlineemote': {
				let username = user.username;
				if (channel != 'botbear1110' && channel != 'hottestbear' && perm < 2000 && !tools.isMod(user, channel)) { return; }
				if (!input[3]) {
					return;
				}

				if (tools.isMod(user, channel) || perm >= 2000) {
					username = channel;
				}

				const alreadyJoined = await sql.Query(`
                    SELECT *
                        FROM Streamers
                            WHERE username =? `,
				[username]);

				if (!alreadyJoined.length) {
					return 'I am not in your channel';
				}

				else {
					await sql.Query('UPDATE Streamers SET offlineemote =? WHERE username =? ', [input[3], username]);
					return `Offline emote is now set to ${input[3]} `;
				}
			}
			case 'trivia': {
				if (!tools.isMod(user, channel) && perm >= 2000) {
					return;
				}

				if (input[3] === undefined) {
					return 'NotLikeThis . This command requires a parameter with the cooldown on trivia. This is set to seconds!';
				}

				const cooldown = (input[3] * 1000);

				return await sql.Query('UPDATE `Streamers` SET `trivia_cooldowns` = ? WHERE `username` = ?', [cooldown, channel]).then(() => {
					return `BloodTrail Successfully set the cooldown of trivia in this channel to ${input[3]} s`;
				}).catch((error) => {
					new messageHandler('botbear1110', JSON.stringify(error)).newMessage();
					return 'NotLikeThis UhOh! Error!';
				});
			}

			case 'pb1': {
				if (!tools.isMod(user, channel) && perm >= 2000) {
					return;
				}

				if (!input[3]) {
					return 'Please provide an url! Example: https://pajlada.pajbot.com';
				}

				if (input[3] === 'reset') {
					await sql.Query('UPDATE Streamers SET banphraseapi =? WHERE username =? ', ['https://pajlada.pajbot.com', channel]);
					return 'pb1 banphrase api has reset';
				}

				await sql.Query('UPDATE Streamers SET banphraseapi =? WHERE username =? ', [input[3], channel]);
				return `pb1 banphrase api is now set to: ${input[3]}/api/v1/banphrases/test`;
			}

			case 'pb2': {
				if (!tools.isMod(user, channel) && perm >= 2000) {
					return;
				}

				if (!input[3]) {
					return 'Please provide an url! Example: https://paj.pajbot.com';
				}

				if (input[3] === 'reset') {
					await sql.Query('UPDATE Streamers SET banphraseapi2 =? WHERE username =? ', [null, channel]);
					return 'pb2 banphrase api has reset';
				}

				await sql.Query('UPDATE Streamers SET banphraseapi2 =? WHERE username =? ', [input[3], channel]);
				return `pb2 banphrase api is now set to: ${input[3]}/api/channel/${user.uid}/moderation/check_message?message=`;
			}
			default:
				return 'Available channel commands: join/leave, [live/offline/title/game]emote, trivia, pb1, pb2';
			}
		} catch (err) {
			console.log(err);
			if (err.name) {
				if (err.name === 'TimeoutError') {
					return `FeelsDankMan api error: ${err.name} `;
				}
			}
			return `FeelsDankMan Error: ${err.response.data.error} `;
		}
	}
};
