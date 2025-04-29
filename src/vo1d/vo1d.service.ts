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
          await message.reply('link e seng mbener mas.');
          return;
        }

        const voiceChannel = message.member?.voice?.channel as VoiceChannel;
        if (!voiceChannel) {
          await message.reply('Mlebet vc riyen mas!');
          return;
        }

        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        });

        try {
          const ytStream = spawn('yt-dlp', [
            '--no-playlist',
            '-f',
            'bestaudio',
            '-o',
            '-',
            '--cookies', './src/assets/cookies/youtube-cookies.txt',
            '--user-agent',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
            url,
          ]);

          ytStream.stderr.on('data', (data) => {
            console.error(`yt-dlp error: ${data}`);
          });

          const resource = createAudioResource(ytStream.stdout);
          const player = createAudioPlayer();
          const subscription = connection.subscribe(player);

          player.play(resource);

          player.on(AudioPlayerStatus.Playing, () => {
            console.log('🎶 Bot is playing audio!');
          });

          player.on('error', (error) => {
            console.error('💥 AudioPlayer error:', error.message);
            if (connection.state.status !== 'destroyed') {
              subscription?.unsubscribe();
              connection.destroy();
            }
          });

          player.on(AudioPlayerStatus.Idle, () => {
            console.log('⏹️ Audio ended');
            if (connection.state.status !== 'destroyed') {
              subscription?.unsubscribe();
              connection.destroy();
            }
          });

          await message.reply('🎶 aku nyimak!');
        } catch (err) {
          console.error('💥 yt-dlp error:', err.message);
          await message.reply('coba ling liyane mas.');
        }
      }
    });

    

    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }
}
