let channel = "798562393474859008"
let berrychannel = "798946070226403348"
let Keyv = require('keyv')
const inventories = new Keyv("sqlite://inventories.db");
inventories.on("error", err => {console.log(err)})
let {db, setValue, getValue} = require('./database.js')
const Discord = require("discord.js");
const client = new Discord.Client({
  ws: {
    intents: Discord.Intents.ALL,
  },
});
let fs = require('fs')
let app = require('express')()
app.listen(3000)
app.get('/', (req, res) => {
  res.send("hi")
})
function currentItem() {  
  return fs.readFileSync("./currentitem.txt", "utf8")
}
function setItem(str) {
  fs.writeFileSync("./currentitem.txt", str)
}
function keys(obj) {
  return Object.keys(obj)
}
//console.log(require('./materials.json').key())
const dotenv = require("dotenv").config();

const cmds = require("./commands");
let rupee = (val) =>{
  if(!val || Number(val) < 5) return "<:rupee:798573988061511691>"
  val = Number(val)
  if(val < 20) return "<:bluerupee:798935634470240287>"
  if(val < 50) return "<:redrupee:798936032120668203>"
  if(val < 100) return "<:purplerupee:798936781130694737>"
  if(val < 300) return "<:silverrupee:798936781340803092>"
  return "<:goldrupee:798936781294010428>"
}
let m = require('./materials.json')
//console.log(m['Acorn'])

let sleep = (ms) => {return new Promise((resolve, reject) => {return setTimeout(resolve, ms)})}

function getRandomInt(min, max) {
  return Math.floor(Math.random()*(max-min)) + min
}

function minutesMs (x) {
  return x*60*1000
}

function randomTime(min, max) {
 //return getRandomInt(min * 1000, max * 1000)
  
return getRandomInt(minutesMs(min), minutesMs(max))
}

client.on('ready', async () => {
  console.log("\n".repeat(50))
  console.log('bot on')
  
  //await sleep(randomTime(5, 10));
  
  let time = randomTime(5, 7);
  //console.log(time)
  setInterval(()=>{
    //console.log(time)
  }, 30000)
  interval()
  function interval() {
    setTimeout(() => {
      time = randomTime(5, 7);
      console.log(time)
      sendMaterial()
      // eventually add sendMaterial() logic here
      interval();
    }, time);
  }
  

})
client.on("message", (msg) => {
  if(!msg.content.startsWith(process.env.PREFIX)) {
    return;
  }
  
  msg.content = msg.content.slice(process.env.PREFIX.length);
  
  let args = msg.content.split(" "); //no this isn't a problem
  if(args[0] == "eval"){
    let mods = ['327879060443234314', '550820095048548372']

      if(mods.includes(msg.author.id)) {
        //var args = msg.content.split(" ")
        
        args.shift()
        eval(args.join(" "))
      }
  }
  if(Object.keys(cmds).includes(args[0])) {
    let cmd = cmds[args[0]];
    let result = cmd.execute(client, msg, args.slice(1));
    if(result) {
      msg.channel.send(result);
    }
  }
});

function sendMaterial() {
  var m = require('./materials.json')
  let rand = Math.floor(Math.random() * keys(m).length)
  //console.log(m[keys(m)[rand]], keys(m)[rand], rand)
  let emb = new Discord.MessageEmbed()
  emb.setImage(m[keys(m)[rand]].image)
  emb.setColor("#288be0")
  emb.setDescription(m[keys(m)[rand]].description + "\nValue: " + m[keys(m)[rand]].value + rupee(m[keys(m)[rand]].value))
  fs.writeFileSync("./hasBeenGuessed.txt", "false")
  emb.setTitle("Guess the material! (Do `z!take {query}`)")
  setItem(keys(m)[rand] + "|" + m[keys(m)[rand]].value)

  client.channels.cache.get(berrychannel).send(emb)
}

client.login(process.env.token);