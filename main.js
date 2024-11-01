import { WechatyBuilder } from "wechaty";
import { FileBox } from "file-box";
import axios from "axios";
import leetcodeDaily from "./leetcodeDaily.js";
import crazyThursday from "./crazyThursday.js";

// EPIC喜加一API
const EPIC_FREE_API =
  "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN";

// 摸鱼API
const MOYU_API = "https://api.vvhan.com/api/moyu?type=json";

// 老婆API
const WAIFU_API = "https://moe.jitsu.top/img/?sort=silver&size=small&type=json";

// 每日放送API
const DAILY_API = "https://api.bgm.tv/calendar";

const triggers = [
  {
    keywords: ["摸摸"],
    response: async (message) => {
      message.say("摸摸");

      try {
        const moyuImageData = await axios.get(MOYU_API);
        const moyuImageUrl = moyuImageData.data.url;

        const fileBox = FileBox.fromUrl(moyuImageUrl);
        await message.say(fileBox);
      } catch (error) {
        console.error("获取图片失败:", error);
        await message.say("接口挂了o(╥﹏╥)o");
      }
    },
  },
  {
    keywords: ["星期四"],
    response: (message) => {
      const posts = crazyThursday.posts;

      // 随机发一条
      const randomIndex = Math.floor(Math.random() * posts.length);
      message.say(posts[randomIndex]);
    },
  },
  {
    keywords: ["喜加一"],
    response: (message) => {
      axios.get(EPIC_FREE_API).then((response) => {
        const freeGames = response.data.data.Catalog.searchStore.elements;
        const result = freeGames.map(
          (game, index) => `
          ${index + 1}. ${game.title}\n${game.description}\n
          `
        );

        message.say(`----今日Epic喜加一----\n${result.join("\n")}`);
      });
    },
  },
  {
    keywords: ["每日一题", "力扣"],
    response: async (message) => {
      const leetcodePromise = await leetcodeDaily;
      const question = leetcodePromise.data.data.todayRecord[0].question;

      const title = question.titleCn || question.title;
      const difficulty = question.difficulty;
      const acRate = question.acRate;
      const url = `https://leetcode-cn.com/problems/${question.titleSlug}`;

      message.say(`今日力扣每日一题：\n${title}\n难度：${difficulty}\n通过率：${acRate * 100}%\n${url}`);
    },
  },
  {
    keywords: ["老婆"],
    response: async (message) => {
      try {
        const waifuImageData = await axios.get(WAIFU_API, {
          params: {
            num: 1,
            size: "mw1024",
          },
        });
        console.log(waifuImageData);
        const waifuImageUrl = waifuImageData.data.pics[0];

        const fileBox = FileBox.fromUrl(waifuImageUrl);
        await message.say(fileBox);
      } catch (error) {
        console.error("获取图片失败:", error);
        await message.say("接口挂了o(╥﹏╥)o");
      }
    },
  },
  {
    keywords: ["放送", "番剧"],
    response: (message) => {
      axios.get(DAILY_API).then((response) => {
        const todayData = response.data[new Date().getDay() - 1].items;

        // rating.total从大到小排序后取前50，再进行rating.score从大到小排序
        const sortedData = todayData
          .sort((a, b) => b.rating?.total ?? 0 - a.rating?.total ?? 0)
          .slice(0, 50)
          .sort((a, b) => b.rating?.score ?? 0 - a.rating?.score ?? 0);
        // 输出其中的name_cn ?? name
        const result = sortedData.map((item) => item.name_cn || item.name);

        message.say(result.join("\n"));
      });
    },
  },
  {
    keywords: ["Ciallo", "0d00", "0721"],
    response: (message) => {
      const cialloResponse = [
        {
          type: "text",
          value: "Ciallo～(∠・ω< )⌒★",
        },
        {
          type: "text",
          value: "わっ私の0721を見てください！",
        },
        {
          type: "text",
          value: "マジエロい先輩！",
        },
        {
          type: "text",
          value: "柚子厨蒸鹅心",
        },
        {
          type: "text",
          value:
            "你这个情况我还真见过，这样吧，你启动steam，搜索魔女的夜宴，点击购买，启动游戏，选再老实的夸一次，就这样因幡同学继续下去，烦恼，这也是演练的一环，没什么吧，普通的说话蒙混过去，机会难得请教下别人吧，那种请求实在是说不出口，夸她，可能会投给因幡吧，进入因幡巡路线。",
        },
        {
          type: "text",
          value:
            "你这个情况我还真没见过。这样吧，你先在steam搜索“魔女的夜宴”点击购买安装好后立即运行打开魔女的夜宴，在主页面点击开始游戏进入游戏页面，然后依次选择“想要先填饱肚子”、“也许吧”、“试着开个玩笑”、“蒙混过去”、“机会难得还是请教别人吧”、“我现在满脑子都是乐队的事情”进入和奏路线。",
        },
        {
          type: "text",
          value:
            "你这个情况我确实没见过，这样吧，你先启动steam，搜索魔女的夜宴，点击购买，启动游戏，选“再老实地夸一次”，“拜托绫地”，“改变观影时间”，“继续跟大家一起行动”，“也许吧”，“正常说话”，“实话实说”，“放弃学习”，“转换心情”，“拜托她再握一次”，“移开视线”，“我比较倾向于绫地”后进入绫地宁宁路线",
        },
        {
          type: "text",
          value: "https://store.steampowered.com/bundle/18378/YUZUSOFT/?l=tchinese",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/01/ViCM9sXIJHDhQpv.jpg",
        },
      ];

      // 随机回复
      const randomIndex = Math.floor(Math.random() * cialloResponse.length);
      const response = cialloResponse[randomIndex];

      if (response.type === "text") {
        message.say(response.value);
      } else if (response.type === "image") {
        const fileBox = FileBox.fromUrl(response.value);
        message.say(fileBox);
      }
    },
  },
];

async function main() {
  const bot = WechatyBuilder.build();

  bot
    .on("scan", (qrcode, status) =>
      console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`)
    )
    .on("login", (user) => console.log(`User ${user} logged in`))
    .on("message", async (message) => {
      console.log(`Message: ${message}`);

      const text = message.text().toLowerCase();

      if (!text) {
        return;
      }

      for (const trigger of triggers) {
        for (const keyword of trigger.keywords) {
          if (text.includes(keyword.toLowerCase())) {
            await trigger.response(message);
            return;
          }
        }
      }
    });
  await bot.start();
}

main().catch(console.error);
