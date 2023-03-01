const { Client, Events, GatewayIntentBits , Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { token } = require('./config.json');
const { MessageCollector } = require("discord-collector");

const express = require('express');
const app = express();

const config = require('./config.json')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
    	GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers
	], 
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] 
});



client.once(Events.ClientReady, c => {
	
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
	let args = message.content.slice(config.prefix.length).trim().split(/ +/)
    let command = args.shift().toLowerCase()
	if (!message.content.startsWith(config.prefix) || message.author.bot) return
    if (command === "apply") {

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('whitelist')
					.setLabel('Apply Now!')
					.setStyle(ButtonStyle.Success),
			);

		const embed = new EmbedBuilder()
			.setTitle("PCRP V5 Whitelist Application")
			.setDescription("Click Below To Get Application Form")
			.setColor(0x2BFF00)
			.setTimestamp();
			await message.channel.send({ embeds: [embed], components: [row] });
	}
});

const whitelistb = new ButtonBuilder()
.setCustomId('accept')
.setLabel('Accept')
.setStyle(ButtonStyle.Success)

const unwhitelistb = new ButtonBuilder()
.setCustomId('decline')
.setLabel('Decline')
.setStyle(ButtonStyle.Primary)

client.on(Events.InteractionCreate, async (interaction) => {

	
	//const favoriteColor = modalSubmit.fields.getTextInputValue("favoriteColorInput");
	
	if (interaction.customId === `whitelist`) {
		
		const modal = new ModalBuilder()
			.setCustomId('myModal')
			.setTitle('PCRP V5 WHITELIST APPLICATION');
		
			const favoriteColorInput = new TextInputBuilder()
			.setCustomId('favoriteColorInput')
			.setLabel("What's your ingame name?")
			.setStyle(TextInputStyle.Short);

			const hobbiesInput = new TextInputBuilder()
			.setCustomId('hobbiesInput')
			.setLabel("BackStory of your character ?")
			.setStyle(TextInputStyle.Paragraph);

		const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
		const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

		
		modal.addComponents(firstActionRow, secondActionRow);
		await interaction.showModal(modal);
		
		console.log(`Reacted`);
	}

	const testchannel = client.channels.cache.get("1070365714638188684")
	const logchannel = client.channels.cache.get("1070563307121033237")
	
	if (interaction.customId === `accept`) {
		const row = new ActionRowBuilder()
      		.addComponents(
        	new ButtonBuilder()
			.setCustomId('nothing')
    		.setLabel('Accepted')
          	.setStyle(ButtonStyle.Success)
          	.setDisabled(true),);

		
        testchannel.messages.fetch(interaction.message.id).then(message => {
            const guild = client.guilds.cache.get(interaction.guild.id);
            //const user = guild.members.cache.get(message.content);
            const aembed = new EmbedBuilder()
              .setTitle(`APPLICATION RESULT | ${interaction.guild.name}`)
              .setDescription(`\n\n> **User : ${message.content} has whitelisted _ENJOY RP!!_**\n> Whitelisted by : ${interaction.user}**\n `)
              .setColor(0x2BFF00)
              .setTimestamp();

			message.edit({content: `**Accepted by : ${interaction.user}**`,components: [row]})
            logchannel.send({content: `${message.content}`,embeds: [aembed]});
            })
    }

	if (interaction.customId === `decline`) {
		const row = new ActionRowBuilder()
      		.addComponents(
        	new ButtonBuilder()
			.setCustomId('nothing')
    		.setLabel('Declined')
          	.setStyle(ButtonStyle.Danger)
          	.setDisabled(true),);
		
		interaction.reply({ content: '**Declined**', ephemeral: true});
		const botMessage = await interaction.channel.send({
			embeds: [
			new EmbedBuilder()
			.setTitle("**Enter Reason To Decline: **")
			.setColor(0x303236),
		]});
		const userMessage = await MessageCollector.asyncQuestion({
			botMessage,
			user: interaction.user.id,
		  });
		testchannel.messages.fetch(interaction.message.id).then(message => {
		const aembed = new EmbedBuilder()
              .setTitle(`APPLICATION RESULT | ${interaction.guild.name}`)
              .setDescription(`\n\n> **User : ${message.content} has Application Declined**\n> **Declined By : ${interaction.user}**\n> **Reason: ${userMessage.content} **\n `)
              .setColor(0xFF0000)
              .setTimestamp();
			
			message.edit({content: `**Declined by : ${interaction.user}**`, components: [row]})
            logchannel.send({content: `${message.content}`,embeds: [aembed]});

			userMessage.delete();
			botMessage.delete();
		});
	}
});


client.on(Events.InteractionCreate, async (modalSubmit) => {
	if (!modalSubmit.isModalSubmit()) return;

	// Get the data entered by the user
	const favoriteColor = modalSubmit.fields.getTextInputValue("favoriteColorInput");
	const hobbies = modalSubmit.fields.getTextInputValue("hobbiesInput");
	
	
	const Admin = new EmbedBuilder()
	.setAuthor({ name: `${modalSubmit.user.tag}`, iconURL: `${modalSubmit.user.displayAvatarURL({ dynamic: true })}`,url: `https://pcrp.gq`})
	.setTitle("Application Form")
	.setDescription("\n")
	.addFields({ name: 'Ingame Name', value: favoriteColor, inline: false })
	.addFields({ name: 'BackStory', value: hobbies, inline: false })
	.setColor(0x2BFF00)
	.setTimestamp();
	const testchannel = client.channels.cache.get("1070365714638188684")

	const accept = new ActionRowBuilder()
	.addComponents([
		whitelistb, unwhitelistb]
	);

	testchannel.send({content: `<@${modalSubmit.user.id}>`, embeds: [Admin], components: [accept]});

	await modalSubmit.reply({ content: 'Your application was submitted successfully!', ephemeral: true});


});



client.login(token);