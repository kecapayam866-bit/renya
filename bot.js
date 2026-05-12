require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let connection;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    connection = joinVoiceChannel({
      channelId: process.env.VOICE_CHANNEL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    console.log("Joined voice channel.");

    connection.on("stateChange", async (_, newState) => {
      console.log(`VC State: ${newState.status}`);

      if (newState.status === VoiceConnectionStatus.Disconnected) {
        try {
          await entersState(
            connection,
            VoiceConnectionStatus.Connecting,
            5_000
          );
          console.log("Reconnecting...");
        } catch {
          console.log("Destroyed connection.");
          connection.destroy();
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
