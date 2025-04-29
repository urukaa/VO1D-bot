// src/discord/discord.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Events } from 'discord.js';

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
    });

    this.client.login(process.env.DISCORD_BOT_TOKEN);
  }
}
