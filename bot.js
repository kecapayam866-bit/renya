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

async function joinVC() {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    const channel = await client.channels.fetch(
      process.env.VOICE_CHANNEL_ID
    );

    if (!channel) {
      console.log("Voice channel not found.");
      return;
    }

    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true,
    });

    console.log(`Joined VC: ${channel.name}`);

    await entersState(
      connection,
      VoiceConnectionStatus.Ready,
      30_000
    );

    console.log("Voice connection ready.");

    connection.on("stateChange", async (_, newState) => {
      console.log(`VC Status: ${newState.status}`);

      if (newState.status === VoiceConnectionStatus.Disconnected) {
        console.log("Disconnected. Reconnecting...");

        try {
          await entersState(
            connection,
            VoiceConnectionStatus.Connecting,
            5_000
          );
        } catch {
          connection.destroy();

          setTimeout(() => {
            joinVC();
          }, 5000);
        }
      }
    });

  } catch (err) {
    console.error("Error joining VC:", err);
  }
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  joinVC();
});

client.login(process.env.TOKEN);
