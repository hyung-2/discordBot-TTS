const {token, clientId, guildId, TTS_channel} = require('./config.json')
const { Client, GatewayIntentBits} = require('discord.js')

const {createAudioPlayer, createAudioResource, joinVoiceChannel} = require('@discordjs/voice');
const googleTTS = require('google-tts-api')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
],})


client.once('ready', (c) => {
  console.log(`TTS 봇 준비 완료: ${c.user.tag}`)
})

let voiceConnection
const audioPlayer = createAudioPlayer()

let ttsTimeout
let disconnectTimeout

const closeTTSUrl = googleTTS.getAudioUrl('TTS 퇴장합니다.', {lang: 'ko'});
const closeAudioResource = createAudioResource(closeTTSUrl);

const ttsChannelId = '1234771905672904774' //tts가 말하게 할 채팅 채널

client.on('messageCreate', async (msg) => {
  if(msg.author.bot) return //봇이 보낸 메세지 거르기
  console.log(msg.content, msg.channelId)

  if(msg.channelId === ttsChannelId){
    try{
      const ttsUrl = googleTTS.getAudioUrl(msg.content, {lang: 'ko', slow: false})
      const audioResource = createAudioResource(ttsUrl)
  
      if(!voiceConnection || !voiceConnection.state.subscription){
  
        voiceConnection = joinVoiceChannel({
          channelId: TTS_channel, //봇이 입장할 음성채널ID
          guildId: guildId,
          adapterCreator: msg.guild?.voiceAdapterCreator,
        })
  
        voiceConnection.subscribe(audioPlayer)
      }
      audioPlayer.play(audioResource)
    }catch(error){
      console.error('에러발생',error)
    }finally{
      clearTimeout(ttsTimeout)
      clearTimeout(disconnectTimeout)
      ttsTimeout = setTimeout(() => audioPlayer.play(closeAudioResource), 60_000)
      disconnectTimeout = setTimeout(() => voiceConnection.destroy(), 15_000)
    }
  }

})



client.login(token)