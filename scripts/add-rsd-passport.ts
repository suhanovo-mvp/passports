#!/usr/bin/env tsx

/**
 * Скрипт для добавления примера паспорта РСД в базу данных
 * Использование: pnpm tsx scripts/add-rsd-passport.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

async function main() {
  console.log("🌱 Adding RSD passport example...");

  // Подключение к БД
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  try {
    // Создаем паспорт РСД
    const [passportResult] = await db.insert(schema.passports).values({
      serviceName: "Назначение региональной социальной доплаты к пенсии неработающим пенсионерам до ГСС",
      serviceCode: "50",
      description: "Региональная социальная доплата до величины городского социального стандарта для неработающих граждан, зарегистрированных по месту жительства в Москве 10 лет и более",
      status: "published",
      version: "1.0",
    });

    const passportId = Number(passportResult.insertId);
    console.log(`✅ Created passport with ID: ${passportId}`);

    // Создаем разделы
    await db.insert(schema.sections).values([
      {
        passportId,
        sectionNumber: 1,
        sectionName: "Общие сведения об услуге",
        data: {
          content: "Вид потребности/заявления: (50) Назначение региональной социальной доплаты к пенсии неработающим пенсионерам до ГСС\n\nОтносится к виду ГСП: Доплаты к пенсии до установленной суммы"
        },
        isCompleted: true,
      },
      {
        passportId,
        sectionNumber: 2,
        sectionName: "Условия назначения",
        data: {
          content: "Для назначения требуется:\n- Постоянная регистрация в регионе в течении 10 лет\n- Пенсионер не работает\n\nИсточник финансирования: Бюджет города Москвы"
        },
        isCompleted: true,
      },
      {
        passportId,
        sectionNumber: 3,
        sectionName: "Размер назначения",
        data: {
          content: "Общий размер пенсии и доплаты:\n- С 01.01.2024: 24 500,00 руб. (Фиксированный размер, до которого производится доплата)\n- С 01.01.2023: 23 313,00 руб.\n- С 01.01.2022: 21 193,00 руб.\n\nПериодичность: ежемесячная"
        },
        isCompleted: true,
      },
      {
        passportId,
        sectionNumber: 4,
        sectionName: "Причины отказа",
        data: {
          content: "(100) представленный запрос и документы не соответствуют установленным требованиям\n(106) отсутствие у заявителя права на получение государственной услуги/функции\n(117) данная услуга или функция уже предоставляется заявителю\n(123) противоречие документов и сведений, полученных с использованием межведомственного информационного взаимодействия\n(142) превышение общей суммы материального обеспечения величины прожиточного минимума пенсионера\n(144) установление факта осуществления работы и(или) иной деятельности, в период которой граждане подлежат обязательному пенсионному страхованию\n(145) неподтверждение факта получения пенсии в городе Москве"
        },
        isCompleted: true,
      },
    ]);
    console.log("✅ Created sections");

    // Создаем нормативный акт
    const [normActResult] = await db.insert(schema.normativeActs).values({
      type: "Постановление Правительства Москвы",
      number: "1268-ПП",
      date: new Date("2009-11-17"),
      title: 'Постановление Правительства Москвы от 17 ноября 2009 г. № 1268-ПП "О региональной социальной доплате к пенсии"',
      description: "Основной нормативный документ, регулирующий назначение РСД",
    });

    await db.insert(schema.passportNormativeActs).values({
      passportId,
      normativeActId: Number(normActResult.insertId),
      relevance: "Основание для назначения региональной социальной доплаты",
    });
    console.log("✅ Created normative acts");

    // Создаем критерии оценки
    await db.insert(schema.criteriaMatrix).values([
      {
        passportId,
        criterionName: "Регистрация по месту жительства в Москве",
        criterionType: "Обязательный",
        description: "Наличие регистрации по месту жительства в Москве",
        dataSource: "Реестр регистрации граждан",
        validationRule: "Срок регистрации >= 10 лет",
        priority: 1,
        normativeBasis: "Постановление Правительства Москвы № 1268-ПП",
      },
      {
        passportId,
        criterionName: "Отсутствие трудовой деятельности",
        criterionType: "Обязательный",
        description: "Пенсионер не осуществляет трудовую деятельность",
        dataSource: "Пенсионный фонд РФ",
        validationRule: "Отсутствие записей о трудовой деятельности в текущем периоде",
        priority: 2,
        normativeBasis: "Постановление Правительства Москвы № 1268-ПП",
      },
      {
        passportId,
        criterionName: "Наличие пенсии в Москве",
        criterionType: "Обязательный",
        description: "Получение пенсии в городе Москве",
        dataSource: "Пенсионный фонд РФ",
        validationRule: "Пенсия назначена и выплачивается в Москве",
        priority: 3,
        normativeBasis: "Постановление Правительства Москвы № 1268-ПП",
      },
    ]);
    console.log("✅ Created criteria");

    // Создаем формулу расчета
    await db.insert(schema.paymentFormulas).values({
      passportId,
      formulaName: "Расчет региональной социальной доплаты до ГСС",
      formulaExpression: "РСД = ГСС - (Пенсия + ЕДВ + НСУ + Другие_выплаты)",
      variables: {
        РСД: "Региональная социальная доплата",
        ГСС: "Городской социальный стандарт (24500 руб. с 01.01.2024)",
        Пенсия: "Размер назначенной пенсии",
        ЕДВ: "Ежемесячная денежная выплата",
        НСУ: "Набор социальных услуг",
        Другие_выплаты: "Иные меры социальной поддержки",
      },
      roundingRule: "До копеек (2 знака после запятой)",
      examples: [
        {
          description: "Пример 1: Пенсия 18000 руб.",
          calculation: "РСД = 24500 - 18000 = 6500 руб.",
        },
        {
          description: "Пример 2: Пенсия 20000 руб. + ЕДВ 2000 руб.",
          calculation: "РСД = 24500 - (20000 + 2000) = 2500 руб.",
        },
      ],
    });
    console.log("✅ Created formulas");

    // Создаем статусную модель
    const statusValues = [
      {
        passportId,
        statusCode: "NEW",
        statusName: "Новое заявление",
        description: "Заявление зарегистрировано в системе",
        isInitial: true,
        isFinal: false,
      },
      {
        passportId,
        statusCode: "VERIFICATION",
        statusName: "Проверка документов",
        description: "Проверка предоставленных документов и сведений",
        isInitial: false,
        isFinal: false,
      },
      {
        passportId,
        statusCode: "CRITERIA_CHECK",
        statusName: "Проверка критериев",
        description: "Проверка соответствия критериям назначения",
        isInitial: false,
        isFinal: false,
      },
      {
        passportId,
        statusCode: "CALCULATION",
        statusName: "Расчет размера",
        description: "Расчет размера региональной социальной доплаты",
        isInitial: false,
        isFinal: false,
      },
      {
        passportId,
        statusCode: "APPROVED",
        statusName: "Назначено",
        description: "Региональная социальная доплата назначена",
        isInitial: false,
        isFinal: true,
      },
      {
        passportId,
        statusCode: "REJECTED",
        statusName: "Отказано",
        description: "В назначении отказано",
        isInitial: false,
        isFinal: true,
      },
    ];

    const statusResults = await db.insert(schema.statusModels).values(statusValues);
    console.log("✅ Created status models");

    // Создаем шаблоны уведомлений
    await db.insert(schema.notificationTemplates).values([
      {
        passportId,
        templateName: "Уведомление о назначении РСД",
        channel: "email",
        subject: "Региональная социальная доплата к пенсии назначена",
        body: `Уважаемый(ая) {{ФИО}}!

Вам назначена региональная социальная доплата к пенсии до величины городского социального стандарта.

Размер доплаты: {{Размер}} руб.
Дата назначения: {{Дата}}

Доплата будет выплачиваться ежемесячно вместе с пенсией.

С уважением,
Департамент труда и социальной защиты населения города Москвы`,
        variables: ["ФИО", "Размер", "Дата"],
      },
      {
        passportId,
        templateName: "Уведомление об отказе в назначении РСД",
        channel: "email",
        subject: "Отказ в назначении региональной социальной доплаты к пенсии",
        body: `Уважаемый(ая) {{ФИО}}!

По результатам рассмотрения Вашего заявления принято решение об отказе в назначении региональной социальной доплаты к пенсии.

Причина отказа: {{Причина}}

Вы можете обжаловать данное решение в установленном законом порядке.

С уважением,
Департамент труда и социальной защиты населения города Москвы`,
        variables: ["ФИО", "Причина"],
      },
      {
        passportId,
        templateName: "Запрос дополнительных документов",
        channel: "portal",
        subject: "Требуются дополнительные документы",
        body: `Уважаемый(ая) {{ФИО}}!

Для рассмотрения Вашего заявления необходимо предоставить дополнительные документы:

{{Список_документов}}

Срок предоставления: {{Срок}}

С уважением,
Департамент труда и социальной защиты населения города Москвы`,
        variables: ["ФИО", "Список_документов", "Срок"],
      },
    ]);
    console.log("✅ Created notification templates");

    console.log("\n✨ RSD passport example added successfully!");
    console.log(`\nПаспорт ID: ${passportId}`);
    console.log("Название: Назначение региональной социальной доплаты к пенсии неработающим пенсионерам до ГСС");
    console.log("Код услуги: 50");
    console.log("Статус: Опубликован\n");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

