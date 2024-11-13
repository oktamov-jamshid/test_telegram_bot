import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Telegraf, Markup } from 'telegraf';
import { Test } from './test.model';

@Injectable()
export class BotService {
  public bot: Telegraf;

  constructor(@InjectModel(Test) private readonly testModel: typeof Test) {
    this.bot = new Telegraf(process.env.BOT_TOKEN);

    // /start komandasi
    this.bot.start((ctx) => this.onStart(ctx));

    // /add_test komandasi
    this.bot.command('add_test', (ctx) => this.onAddTest(ctx));

    // "A'zo bo'ldim" tugmasi bosilganda
    this.bot.action('verify_membership', (ctx) => this.onVerifyMembership(ctx));

    // Fanni tanlash tugmalari uchun
    this.bot.hears(['Fizika', 'Matematika'], (ctx) =>
      this.onChooseSubject(ctx),
    );

    // Test javobini tekshirish
    this.bot.on('callback_query', (ctx) => this.onAnswer(ctx));
  }

  // Botni ishga tushirish metodi
  startBot() {
    this.bot.launch();
  }

  // Start komandasida foydalanuvchiga kanallarga a'zo bo'lish talabini yuborish
  async onStart(ctx) {
    const isAdmin = ctx.from.id === parseInt(process.env.ADMIN_ID);

    if (isAdmin) {
      ctx.reply("Admin sizga kanallarga a'zo bo'lish shart emas.");
    } else {
      ctx.reply(
        "Iltimos, quyidagi kanallarga a'zo bo'ling:",
        Markup.inlineKeyboard([
          [
            Markup.button.url(
              'Salom Polvonim kanali',
              `https://t.me/${process.env.CHANNEL_ID_1}`,
            ),
          ],
          [
            Markup.button.url(
              'Men Polvonim kanali',
              `https://t.me/${process.env.CHANNEL_ID_2}`,
            ),
          ],
          [Markup.button.callback("A'zo bo'ldim", 'verify_membership')],
        ]),
      );
    }
  }

  // Foydalanuvchining a'zo bo'lganligini tekshirish
  async onVerifyMembership(ctx) {
    const isMember1 = await this.checkUserMembership(
      ctx,
      process.env.CHANNEL_ID_1,
    );
    const isMember2 = await this.checkUserMembership(
      ctx,
      process.env.CHANNEL_ID_2,
    );

    if (isMember1 && isMember2) {
      await ctx.reply(
        "A'zo bo'lingan. Fanni tanlang:",
        Markup.keyboard([['Fizika', 'Matematika']])
          .resize()
          .oneTime()
          .selective(),
      );
    } else {
      await ctx.reply(
        "Iltimos, barcha kanallarga a'zo bo'ling va yana urinib ko'ring.",
      );
    }
  }

  // Admin test qo'shishi uchun fan va savol kiritish jarayoni
// Admin test qo'shishi uchun fan va savol kiritish jarayoni
async onAddTest(ctx) {
  const isAdmin = ctx.from.id === parseInt(process.env.ADMIN_ID);
  if (!isAdmin) return ctx.reply("Faqat adminlar test qo'shishi mumkin.");

  // Messagedagi to'liq matnni olish (komandani olib tashlash)
  const message = ctx.message.text.replace("/add_test ", "").trim();

  // Regex bilan parametrlarni olish (ajratgich sifatida | ishlatildi)
  const regex =
    /^([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+)$/;
  const match = message.match(regex);

  if (!match) {
    return ctx.reply(
      `Iltimos, testni to\'g\'ri formatda kiriting. 
      Format: /add_test Savol | Fan | A: Javob1 | B: Javob2 | C: Javob3 | To\'g\'ri javob`,
    );
  }

  const question = match[1];
  const subject = match[2];
  const answerA = match[3];
  const answerB = match[4];
  const answerC = match[5];
  const correctAnswer = match[6];

  // Ma'lumotlarni test jadvaliga qo'shish
  try {
    const test = await this.testModel.create({
      question,
      subject,
      answers: `${answerA}, ${answerB}, ${answerC}`,
      correctAnswer,
    });

    ctx.reply(`Test qo'shildi: ${question}`);
  } catch (error) {
    console.error(error);
    ctx.reply("Testni qo'shishda xatolik yuz berdi.");
  }
}


  // Foydalanuvchi tanlagan fan bo'yicha testlarni ko'rsatish
  async onChooseSubject(ctx) {
    const subject = ctx.message.text;
    const tests = await this.testModel.findAll({
      where: { subject: subject },
    });

    if (tests.length === 0) {
      ctx.reply(`Hozircha ${subject} bo'yicha testlar mavjud emas.`);
    } else {
      for (const test of tests) {
        const answers = test.answers.split(', ').map((answer) => {
          const [label, text] = answer.split(': ');
          return {
            text: `${label}: ${text}`,
            callback_data: `answer_${test.id}_${label}`,
          };
        });

        ctx.reply(test.question, {
          reply_markup: {
            inline_keyboard: [answers],
          },
        });
      }
    }
  }

  // Foydalanuvchi javobini tekshirish
  async onAnswer(ctx) {
    const queryData = ctx.callbackQuery.data;
    const [_, testId, answer] = queryData.split('_');
    const test = await this.testModel.findByPk(testId);

    if (!test) {
      return ctx.reply('Test topilmadi.');
    }

    const userAnswer = answer.trim();
    if (userAnswer === test.correctAnswer) {
      ctx.reply("To'g'ri javob!");
    } else {
      ctx.reply("Xato javob, qaytadan urinib ko'ring!");
    }

    await ctx.answerCbQuery();
  }

  // Kanallarga a'zo bo'lishni tekshiruvchi yordamchi funksiya
  private async checkUserMembership(
    ctx: any,
    channelUsername: string,
  ): Promise<boolean> {
    try {
      const memberStatus = await ctx.telegram.getChatMember(
        channelUsername,
        ctx.from.id,
      );
      return (
        memberStatus.status === 'member' ||
        memberStatus.status === 'administrator'
      );
    } catch (error) {
      return false;
    }
  }
}
