// src/discord/discord.service.ts
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Events, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';

@Injectable()
export class vo1dService implements OnModuleInit {
  private client: Client;

  onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.once(Events.ClientReady, () => {
      console.log(`🤖 Logged in as ${this.client.user?.tag}`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;

      if (message.content === '!hi') {
        await message.reply('hi uruka');
      }
      if (message.content.startsWith('!puter')) {
        const url = message.content.split(' ')[1];
        if (!url || !ytdl.validateURL(url)) {
          message.reply('link e seng mbener mas.');
          return;
        }

        const voiceChannel = message.member?.voice?.channel as VoiceChannel;
        if (!voiceChannel) {
          message.reply('Mlebet vc riyen mas!');
          return;
        }

        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        });

        const stream = ytdl(url, {
          filter: 'audioonly',
          quality: 'highestaudio',
          highWaterMark: 1 << 25,
        });

        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          connection.destroy();
        });

        message.reply('🎶 aku nyimak!');
      }
    });

    

    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }
}
