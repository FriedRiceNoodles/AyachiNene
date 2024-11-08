import { WechatyBuilder } from "wechaty";
import { FileBox } from "file-box";
import axios from "axios";
import leetcodeDaily from "./leetcodeDaily.js";
import crazyThursday from "./crazyThursday.js";
import qrcodeTerminal from "qrcode-terminal";
import xml2js from "xml2js";
import { getSystemSummary } from "./status.js";

// Ani字幕组RSS
const ANI_RSS = "https://share.dmhy.org/topics/rss/user_id/747291/rss/rss.xml";

// 美国总统选举结果API
const ELECTION_API = "https://static.files.bbci.co.uk/elections/data/news/election/2024/us/banner";

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
    keywords: ["状态", "系统"],
    response: async (message) => {
      const systemSummary = await getSystemSummary();
      await message.say(systemSummary);
    },
  },
  {
    keywords: ["re0", "从零"],
    response: async (message) => {
      try {
        const rssData = await axios.get(ANI_RSS);
        const parser = new xml2js.Parser();
        parser.parseString(rssData.data, (err, result) => {
          if (err) {
            console.error("解析RSS失败:", err);
            return;
          }

          const items = result.rss.channel[0].item;
          const re0Items = items.filter((item) => item.title[0].includes("從零開始的異世界生活"));

          const title = re0Items[0].title[0];
          // 磁力链接
          const magnet = re0Items[0].enclosure[0].$.url;

          const text = `
          ----Re0最新话----
          标题：${title}
          磁力链接：${magnet}
          `;

          message.say(text);
        });
      } catch (error) {
        console.error("获取RSS失败:", error);
        await message.say("接口挂了o(╥﹏╥)o");
      }
    },
  },
  // {
  //   keywords: ["选举", "总统"],
  //   response: async (message) => {
  //     const electionData = await axios.get(ELECTION_API);

  //     const electionResult = electionData.data.banners[0].scoreboard;

  //     // 哈里斯
  //     const harris = electionResult.countSummaries.find((candidate) => candidate.party.code === "DEM");
  //     // 特朗普
  //     const trump = electionResult.countSummaries.find((candidate) => candidate.party.code === "REP");

  //     const result = `
  //     美国总统大选实时数据
  //       -------------------
  //         哈里斯：
  //           得票数：${harris.dataFormatted.count.value}
  //           得票率：${harris.dataFormatted.share.value}%
  //           普票数：${harris.dataFormatted.votes.value}
  //           普票得票率：${harris.dataFormatted.popularVoteShare.value}%

  //         特朗普：
  //           得票数：${trump.dataFormatted.count.value}
  //           得票率：${trump.dataFormatted.share.value}%
  //           普票数：${trump.dataFormatted.votes.value}
  //           普票得票率：${trump.dataFormatted.popularVoteShare.value}%
  //       -------------------
  //       PS：美国总统大选规则：
  //         1. 美国总统选举是一种间接选举，选民投票选举各州的选举人，选举人再选举总统；
  //         2. 选举人票数超过270即可当选总统。
  //     `;

  //     message.say(result);
  //   },
  // },
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
          type: "text",
          value: `宁宁你到底给我下了什么药啊😭

          你竟然能让我在一天24小时🤕
          
          一千四百四十分钟八万六千二百六十二秒😭
          
          都在想你啊🤗🤗
          
          魔女难藏泪，入目皆柊史。魔女衣装庆新生，援桌骑士踏幽冥，jk校服装痴傻，房间自爆战天下，名宁宁，化魔女，磨桌角，因挚爱，集碎片，放柊史，上轮回，战巡䌷，宁宁病名为爱，愿与世界为敌，戎马一生为柊史。
          
          思柊史拳👊思如泉涌😭
          
          念柊史剑😤念念不忘😭
          
          土柊史掌✋生生世世😭
          
          柊史柊史保科柊史😭😭😭
          
          图书馆的相遇！第一道光！🥰
          
          挑担下的真相！居然是你！😨
          
          狂热的救世主！0721！😡`,
        },
        {
          type: "text",
          value:
            "Ciallo～(∠・ω< )⌒☆ 宁宁在二次元又过得怎样呢🤔在那边开心吗😥有没有吃饱饭呢🙁学习怎么样，没有什么不会的题吧🧐睡觉能睡的安稳吗，在没有尽头的世界😔。有没有受到不公平的待遇，或是被谁欺负了呢😫对不起，宁宁，我没能保护好你，是我的不对😭对不起😭，我爱你😘，对不起😭，我爱你😘，对不起😭，我爱你😘是我对不住你宁宁幸亏☺️☺️咱们没结婚😉，如果领了证😥😥😥，我会耽误你一辈子的😝😝😝我要走啦～😞😞😣😣你一定保重啊😌再见🙁再见😞😞😞还会再见吗🥺🥺宁宁，再见的时候你要幸福😄😄😄好不好，宁宁😢你要开心😧😧你要幸福好不好，开心啊🥺幸福🤧🤧你的世界以后没有我了😰😰😰没关系你要自己幸福🥺🥺🥺宁宁😨😨😨宁宁😫😫😫宁宁😭😭😭没有你我怎么活啊😭😭宁宁😭😭宁宁😭😭宁宁😭😭没有你我还怎么活啊😭宁宁你带我走吧宁宁！📣😢宁宁你带我走吧宁宁！！📣😰宁宁你带我走吧宁宁！！！📣😭 Ciallo～(∠・ω< )⌒☆",
        },
        {
          type: "text",
          value: `妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿妈的，给美咕噜可爱完了，人活着哪有不喜欢美咕噜的🥰🥰🥰硬撑罢了，妈的，忍不了😡😡😡一拳把柚子社打爆！👿👿👿
          叮，抱歉，您的句子或视频画面中当中可能含有『因幡爱瑠』『美咕噜』『ciallo』『因幡巡』等字眼，我可以认为您对因幡爱瑠进行了评价，已触发关键词，请您对我们的工作进行谅解🤓👉安排！
          你刚刚是评价了因幡爱瑠是吗？
          我认为因幡爱瑠是一个极其需要尊重的老角色，因为她在魔女的夜宴存在的这几年内，给这个游戏带来了巨大的热度，如果没有因幡爱瑠，魔女的夜宴可能就没有今天，所以因幡爱瑠应该是柚子厨全体尊重的对象，美咕噜线的剧情不但制作精良，而且特别有代入感，如果没有玩过gal就无法明白她的魅力，一但不能完全代入剧情，这个角色就是平平无奇，此时需要的就是丰富的gal经验以及柚子社的作品来弥补对这个角色的理解不足，当厨力大成时即可爱上这个完美的女主，人们都无脑看涩涩cg，但这个主角真的没有你们想的那么简单，她需要在剧情中考虑着太多，另外，Ciallo～(∠・ω< )⌒★，你们评价不了美咕噜的因为她是我老婆`,
        },
        {
          type: "text",
          value: `因幡巡适合结婚的十个理由
          1.美咕噜虽然外表看起来可爱，其实内在也很可爱，超级可爱！世界第一可爱！宇宙第一可爱！
          2.因为美咕噜小小的，所以能毫不费劲地抱在身上，在她耳边甜言细语。
          3.游戏值爆表，爱玩gal，爱玩怪猎可以带我乱杀全场，躺着也能收装备，娶回家满满的安全感。某种意义上来说我也可以成为一个废人投入美咕噜的温柔乡（？）
          4.经过我的不懈努力，成功让美咕噜交到许多新朋友还化解美咕噜的心结，这份改变足以说明为我在她心目中的地位。不怕婚后二人整日争吵。
          5.虽然在一起经历了很多，但还是保有少女心，留有自己的一份底线。坚强又可爱的美咕噜，有几个人不喜欢呢。6.拥有强大厨艺，可以每天吃到不一样的美食，正所谓要想抓住男人的心要先抓住男人的胃。这么一个厨艺值爆棚的小姑娘，难道有人不想娶回家吗？
          7.拥有非常正直的三观，以后有了孩子一定能成为一位好妈妈。
          8.有责任心，可以肩负起身为人妻的职责。
          9.我是美咕噜厨。
          10.美咕噜！因幡巡！因幡爱瑠！`,
        },
        {
          type: "text",
          value: `不喜欢美咕噜的人有难了，很难想象，一个精神状态正常的人会做出“不喜欢美咕噜”这种愚蠢的选择。美咕噜优秀的厨艺与卡哇伊的性格，可以说目前所有纸片人中最优秀的，没有之一。不喜欢美咕噜的朋友失去的不仅仅是一次纸片人的体验，而是一种最基本的对纸片人的理解与精神信仰。美咕噜明明可以在将大家的gal体验带入一个全新的高度，可是你竟然放弃了这样的机会。那今后提起gal你必将会坠入冰冷的深渊，体验绝望的后悔与没落感。玩gal不喜欢美咕噜，就像四大名著不看红楼梦，说明这个人文学造诣和自我修养不足，他理解不了这种内在的阳春白雪`,
        },
        {
          type: "text",
          value: `叮，抱歉，您的句子或视频画面中当中可能含有『因幡爱瑠』『美咕噜』『ciallo』『因幡巡』等字眼，我可以认为您对因幡爱瑠进行了评价，已触发关键词，请您对我们的工作进行谅解🤓👉安排！
          你刚刚是评价了因幡爱瑠是吗？
          我认为因幡爱瑠是一个极其需要尊重的老角色，因为她在魔女的夜宴存在的这几年内，给这个游戏带来了巨大的热度，如果没有因幡爱瑠，魔女的夜宴可能就没有今天，所以因幡爱瑠应该是柚子厨全体尊重的对象，美咕噜线的剧情不但制作精良，而且特别有代入感，如果没有玩过gal就无法明白她的魅力，一但不能完全代入剧情，这个角色就是平平无奇，此时需要的就是丰富的gal经验以及柚子社的作品来弥补对这个角色的理解不足，当厨力大成时即可爱上这个完美的女主，人们都无脑看涩涩cg，但这个主角真的没有你们想的那么简单，她需要在剧情中考虑着太多，另外，Ciallo～(∠・ω< )⌒★，你们评价不了美咕噜的因为她是我老婆`,
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/01/ViCM9sXIJHDhQpv.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/evhfWnL4qV6ucpM.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/FWeU5BLgKazhJHu.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/DhS8qpwCQVmF6xk.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/lVdxnrzgmKH9C5s.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/oDFbUW7SVhJITGf.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/4xNWXOjKhTVc8nZ.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/CuTPgs473W2xkfY.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/RjOhkASfX4IP5Gx.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/s75XmVEHtw4vYxP.gif",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/Br5VLWd9ISwMKJp.jpg",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/q28lkCgDFEo6iuR.gif",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/uLJUkeHtSRcF4rN.gif",
        },
        {
          type: "image",
          value: "https://s2.loli.net/2024/11/02/4yhbJUIkeaG5BMr.jpg",
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
    .on("scan", (qrcode, status) => {
      console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`);
      qrcodeTerminal.generate(qrcode, { small: true });
    })
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
