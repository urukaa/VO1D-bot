import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { spawn } from 'child_process';
import { Client, GatewayIntentBits, Events, VoiceChannel } from 'discord.js';
import * as ytdl from 'ytdl-core';

@Injectable()
export class vo1dService implements OnModuleInit {
  private client: Client;

  onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
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

        let stream;
        try {
        const ytStream = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);

        ytStream.stderr.on('data', (data) => {
        console.error(`yt-dlp error: ${data}`);

        const resource = createAudioResource(ytStream.stdout);
        });

        } catch (err) {
        console.error('💥 ytdl error:', err.message);
        message.reply('coba ling liyane mas.');
        return;
        }


        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

       const subscription = connection.subscribe(player);

       player.play(resource);

       player.on(AudioPlayerStatus.Playing, () => {
         console.log('🎶 Bot is playing audio!');
       });

       player.on('error', (error) => {
         console.error('💥 AudioPlayer error:', error.message);
       });

       player.on(AudioPlayerStatus.Idle, () => {
         console.log('⏹️ Audio ended');
         subscription?.unsubscribe();
         connection.destroy();
       });

        message.reply('🎶 aku nyimak!');
      }
    });

    

    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }
}
