const Discord = require("discord.js");
const moment = require("moment");
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

let {setValue, db} = require('./database.js')
let Keyv = require('keyv')
var inventories = new Keyv("sqlite://inventories.db");
const PREFIX = process.env.PREFIX;
let rupee = (val) =>{
  if(!val || Number(val) < 5) return "<:rupee:798573988061511691>"
  val = Number(val)
  if(val < 20) return "<:bluerupee:798935634470240287>"
  if(val < 50) return "<:redrupee:798936032120668203>"
  if(val < 100) return "<:purplerupee:798936781130694737>"
  if(val < 300) return "<:silverrupee:798936781340803092>"
  return "<:goldrupee:798936781294010428>"
}
let fs = require('fs')
cmds = { //gimme a bit to fix some stuff
  help: {
    name: "help",
    description: "Shows all commands, or shows help on a certain command",
    syntax: "help [cmd]",
    execute: function (bot, message, args) {
      if (args[0]) {
        if (!Object.keys(cmds).includes(args[0])) {
          return cmds.help.execute(bot, message, []);
        } else {
          let embed = new Discord.MessageEmbed()
            .setColor('#288be0')
            .setTitle(`Help for '${args[0]}'`)
            .addField(`Description`, cmds[args[0]].description)
            .addField(`Syntax`, `\`${PREFIX}${cmds[args[0]].syntax}\``)
            .setFooter(
              `Requested by ${message.author.username}`,
              message.author.displayAvatarURL()
            );
          return embed;
        }
      } else {
        let embed2 = new Discord.MessageEmbed()
        .setColor('#288be0')
          .setTitle(`BotW Bot Help`)
          .setThumbnail(bot.user.avatarURL())
          .setFooter(
            `(Requested by ${message.author.username})`,
            message.author.displayAvatarURL()
          );
        for (cmd of Object.keys(cmds)) {
          embed2.addField(
            `\`${PREFIX}${cmds[cmd].name}\``,
            cmds[cmd].description
          );
        }
        return embed2;
      }
    },
  },
  take: {
    name: "take",
    description: "Guess the item to take it!",
    syntax: "take [query]",
    execute: function(bot, message, args) {
      var varname = fs.readFileSync("./currentitem.txt", "utf8").split("|")[0].replace(/_/g, " ")
      let guess = args.join(" ").toLowerCase()
      let item = fs.readFileSync("./currentitem.txt", "utf8").split("|")[0].replace(/_/g, " ").toLowerCase()
      let val = fs.readFileSync("./currentitem.txt", "utf8").split("|")[1]
      let hasBeenGuessed = (fs.readFileSync("./hasBeenGuessed.txt", "utf8") == 'true')
      
          
      if(guess == item && !hasBeenGuessed){ 
        db.get(message.author.id).then(v=>{
        inventories.get(message.author.id).then(async inv => {
        
        if(v == null) v = 0

        let newTotal = Number(v) + Number(val)
        //setValue(message.author.id, newTotal)
        
        
        if(inv == null) inv = {'items':[]}
        //console.log(inv)
        if(inv.items.map(x=>Object.keys(x)[0]).includes(varname)){
            var json = inv.items.find(x=>Object.keys(x)[0] == varname)
            json[varname].count++
            for(i=0;i<inv.items.length;i++){
              if(Object.keys(inv.items[i])[0] == varname){
                inv.items[i] = json
                break
              }
            }
            await inventories.set(message.author.id, inv)
        }
        else {
          if(inv.items.length >= 15) {
            message.channel.send("Your inventory is full! You may not pick up any more unique items!")
            return
          }
          var json = {}
          json[varname] = {"count": 1, "value": Number(val)}
          
           inv.items.push(json)
           await inventories.set(message.author.id, inv)
        }
        message.channel.send("Correct! The item has been added to your inventory! (do `z!inv` to check it)")
        fs.writeFileSync('hasBeenGuessed.txt', "true")
        })
        })
        
      }
      
      else if(guess != item) {
        message.channel.send("Incorrect!")
      }
      else if(hasBeenGuessed) {
        message.channel.send("This has already been guessed")
      }
      }
      
    
  },
  lb: {
    name: "lb",
    description: "Displays the " + rupee() + " count leaderboard",
    syntax: "lb",
    execute: function(client, message) {
      db.list().then(async list=> {
        var str = "";
        for(i=0;i<list.length;i++){
          var bal = await db.get(list[i])
          var user = client.users.cache.get(list[i]).username
          list[i] = ["**[" + user + "]()**: ", bal, rupee(bal)]
          
        }
        list.sort((a, b) => (a[1] > b[1]) ? -1 : 1)
        //console.log(list)
        for(i=0;i<list.length;i++){
          list[i] = "**" + (Number(i) + 1) + ".** " + list[i].join("")
        }
        list = list.slice(0, 10)
        let emb = new Discord.MessageEmbed()
        emb.setColor("#288be0")
        emb.setTitle("Leaderboard:")
        emb.setDescription(list.join('\n'))
        message.channel.send(emb)
      })
    }
  },
  bal: {
    name: "bal",
    description: "Displays the " + rupee() + " count of you or a user",
    syntax: "bal [user (optional)]",
    execute: function(client, message, args){
      if(!args[0]) args[0] = message.author.id
      if(!client.users.cache.get(args[0].replace(/[<@>!]/g, ""))) {
        message.channel.send("Invalid User!")
        return
      }
      db.get(args[0].replace(/[<@>!]/g, "")).then(x=>{
        if(x== null) x = 0
        var emb = new Discord.MessageEmbed()
        .setColor('#288be0')
        .setDescription("<@" + args[0].replace(/[<@>]/g, "") + "> has " + x + rupee(x))
        message.channel.send(emb)
      })
    }
  },
  inv: {
    name: "inv",
    description: "Displays your inventory (BETA)",
    syntax: "inv",
    execute: function(bot, message) {

      inventories.get(message.author.id).then(json => {
        //message.channel.send("```json\n" + JSON.stringify(json, null, 2) + "```")
        console.log(json.items[json.items.length - 1])
        var emb = new Discord.MessageEmbed()
        emb.setColor('#288be0')
        emb.setTitle(message.author.username + "'s Inventory")
        var desc = []
        if(json == undefined) {
          desc.push("Your inventory is empty!")
        }
        
        else {
        for(i=0;i<Object.keys(json.items).length;i++){
          var e = Object.keys(json.items[i])[0]
          //console.log(e)
          desc.push("• **" + e + " x" + json.items[i][e].count + "**\n   (" + json.items[i][e].value + rupee(json.items[i][e].value) + " each)")
          
        }
        }
        emb.setDescription(desc.join("\n"))
        message.channel.send(emb)
      })
    }
  },
  sell: {
  name: "sell",
  description: "Sell an item for rupees",
  syntax: "sell {#/all} {item}",
  execute: function (client, message, args) {
    inventories.get(message.author.id).then(inv => {
      if(inv == undefined) {
        message.channel.send("You have nothing in your inventory!")
        return
      }
      if(!args[0]) {
        message.channel.send("Please provide an amount!")
        return
      }
      if(isNaN(args[0]) && args[0].toLowerCase() != "all"){
        message.channel.send("Please provide a valid amount")
        return
      }
      if(parseInt(args[0]) < 1){
        message.channel.send("Please provide a valid amount")
        return
      }
      if(!args[1]) {
        if (args[0].toLowerCase() == "all") {
          // finish this in a bit lol
        }
        message.channel.send("Please provide something to sell!")
        return
      }
      args[1] = message.content.split(/ (.+)/)[1].split(/ (.+)/)[1]
      //if(!args[1]) args[1] = 1
        if(!inv.items.map(x=>Object.keys(x)[0].toLowerCase()).includes(args[1].toLowerCase())) {
        message.channel.send("You do not have this item!")
        return
      }
      var json = inv.items.find(x=>Object.keys(x)[0].toLowerCase() == args[1].toLowerCase())
      if(args[0].toLowerCase() == "all") args[0] = json[Object.keys(json)[0]].count
      args[0] = Number(args[0])
      if(json[Object.keys(json)[0]].count < args[0]) {
        message.channel.send("You do not have that amount of items!")
        
      }
      var plural = args[0] > 1 ? "s" : ""
      let price = args[0] * json[Object.keys(json)[0]].value
      db.get(message.author.id).then(async n => {
        setValue(message.author.id, price + n)
      if(json[Object.keys(json)[0]].count == args[0]) {
      inv.items.remove(json)
      await inventories.set(message.author.id, inv)
      
      message.channel.send("Sold " + args[0] + " " + Object.keys(json)[0] + plural + " for a total of " + price + rupee(price) + ". You now have " + Number(price + n) + rupee(Number(price + n)))
      }
      else {
        json[Object.keys(json)[0]].count--
        inv[Object.keys(json)[0]] = json[Object.keys(json)[0]]
        await inventories.set(message.author.id, inv)
        message.channel.send("Sold " + args[0] + " " + Object.keys(json)[0] + plural + " for a total of " + price + rupee(price) + ". You now have " + Number(price + n) + rupee(Number(price + n)))
      }
     
      })

    })
  }
  }
}

module.exports = cmds