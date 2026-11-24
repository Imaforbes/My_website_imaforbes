// src/utils/blogLocalization.js
// Bilingual (ES / EN) localization for Blog Posts (Poems, Letters, Articles).
// Guarantees that switching the site language between Spanish and English
// translates all blog titles, excerpts, and full texts seamlessly.

const BLOG_TRANSLATIONS = {
  1: {
    es: {
      title: "El amor de mi vida ❤️‍🩹",
      content:
        "Tú siempre serás mi primer amor.\nLlegaste cuando más necesitaba creer en la magia de los encuentros.\nAgradecerte todo sería poco frente a lo que despertaste en mí.\nEres mi musa, la voz que habita mis silencios,\ny mi corazón —paciente y fiel— te esperará siempre,\nporque el primer amor no se olvida,\nsolo aprende a vivir en la memoria.",
    },
    en: {
      title: "The love of my life ❤️‍🩹",
      content:
        "You will always be my first love.\nYou arrived when I most needed to believe in the magic of encounters.\nThanking you for everything would fall short compared to what you awakened in me.\nYou are my muse, the voice that inhabits my silences,\nand my heart—patient and faithful—will wait for you always,\nbecause first love is never forgotten,\nit only learns to live on in memory.",
    },
  },
  2: {
    es: {
      title: "Mi reunión con mis amigos irlandeses",
      content: "Una cena maravillosa con gente maravillosa.",
    },
    en: {
      title: "My reunion with my Irish friends",
      content: "A wonderful dinner with wonderful people.",
    },
  },
  3: {
    es: {
      title: "Mi reencuentro con mi hogar irish ✨",
      content:
        "Una cena maravillosa con gente maravillosa.\nMis buenos amigos irlandeses vinieron a México para conocer a su nieta, y durante su estancia pasé a saludarlos y compartir una cena muy amena 🥰.\n\nEllos son las personas con las que viví durante mi estadía en Irlanda, una etapa que guardo en el corazón como uno de los momentos más lindos de mi vida. Volver a verlos fue como abrir una ventana al pasado y sentir, por un instante, que el tiempo se detenía.\n\nMe siento orgulloso de mí, porque me di cuenta de que no estoy tan mal en el inglés 😅 —aunque sé que debo seguir practicando día a día para expresarme mejor—.\n\nAl final de la noche, entre risas, recuerdos y el aroma de la comida, me invadió una gratitud profunda.\nGratitud por la vida, que vuelve a cruzar mis caminos con personas tan especiales; por los lazos que resisten la distancia; por los momentos que se vuelven eternos cuando se viven desde el corazón. 🌿✨",
    },
    en: {
      title: "Reuniting with my Irish home ✨",
      content:
        "A wonderful dinner with wonderful people.\nMy dear Irish friends came to Mexico to meet their granddaughter, and during their stay I stopped by to greet them and share a lovely dinner together 🥰.\n\nThey are the family I lived with during my time in Ireland—a chapter I hold in my heart as one of the most beautiful moments of my life. Seeing them again felt like opening a window to the past and feeling, for a moment, that time stood still.\n\nI feel proud of myself because I realized my English isn't bad at all 😅—even though I know I must keep practicing every day to express myself even better.\n\nAt the end of the night, amid laughter, memories, and the aroma of dinner, a deep sense of gratitude washed over me.\nGratitude for life, which crosses my path once again with such special people; for bonds that withstand distance; for moments that become eternal when lived from the heart. 🌿✨",
    },
  },
  4: {
    es: {
      title: "Guillermo del Toro y la invencible ternura de la esperanza ❤️‍🩹",
      content:
        "“Yo veía el amanecer y decía: ¿por qué al sol no le importa mi dolor?\nY luego me di cuenta de que era a mi dolor al que no le importaba el sol.\nTienes que aceptar que el sol siempre va a salir, no importa qué tan mal te sientas.”\n\nSalió a recorrer el mundo.\nY el mundo, creo yo, lo acogió de vuelta.\nHace mucho que no sé de él.\n¿Morirá tarde o temprano? Creo que sí.\nY tal vez eso lo haga un niño de verdad.",
    },
    en: {
      title: "Guillermo del Toro and the invincible tenderness of hope ❤️‍🩹",
      content:
        "“I used to watch the sunrise and say: why doesn't the sun care about my pain?\nAnd then I realized it was my pain that didn't care about the sun.\nYou have to accept that the sun is always going to rise, no matter how bad you feel.”\n\nHe went out to travel the world.\nAnd the world, I believe, welcomed him back.\nI haven't heard from him in a long time.\nWill he die sooner or later? I think so.\nAnd perhaps that is what makes him a real boy.",
    },
  },
  5: {
    es: {
      title: "Mi mayor miedo es…",
      content:
        "Alguna vez, una persona muy guardada en mi corazón me hizo una pregunta que, en su momento, respondí sin pensar.\nMe preguntó: ¿le tienes miedo a algo?\nY yo, con la ligereza de quien aún no se conoce del todo, respondí que no.\n\nRespondía que no temía a las alturas —aunque el vértigo me abrazara—, que tampoco temía a la oscuridad. Pero mientras mi mente se distraía buscando respuestas simples, mi alma susurraba otra verdad por las noches, y yo fingía no escucharla.\n\nHoy, al fin, empiezo a entenderlo.\nSí tengo miedo.\nLe tengo miedo a la pérdida de mi gente, al simple hecho de abrir los ojos y descubrir que ya no están, que se han ido para siempre.\n\nNo es miedo a la soledad —he aprendido a caminar con ella—, sino a no volver a oler los aromas que amo, a no sentir los abrazos que me salvaban del naufragio, a no saborear esos sazones que llenaban mi vida de ternura.\n\nMe aterra el silencio que dejan las ausencias.\nEse instante en que el tiempo no concede tregua y, día tras día, marchita lo que más amamos.\n\nPorque nada es para siempre, y sin embargo, en el recuerdo, todo sigue latiendo. 🌙💫",
    },
    en: {
      title: "My greatest fear is…",
      content:
        "Once, someone held very deep in my heart asked me a question that, at the time, I answered without thinking.\nThey asked me: are you afraid of anything?\nAnd I, with the lightness of someone who doesn't yet fully know himself, answered no.\n\nI used to say I wasn't afraid of heights—even when vertigo embraced me—nor afraid of the dark. Yet while my mind distracted itself looking for simple answers, my soul whispered another truth at night, and I pretended not to hear it.\n\nToday, at last, I begin to understand.\nI am afraid.\nI am afraid of losing my people—of simply opening my eyes and discovering they are no longer here, that they are gone forever.\n\nIt is not a fear of solitude—I have learned to walk alongside it—but of never again breathing the scents I love, of never feeling the embraces that saved me from shipwreck, of never tasting the home-cooked flavors that filled my life with tenderness.\n\nI am terrified of the silence left behind by absence.\nThat instant when time grants no truce and, day after day, withers what we love most.\n\nBecause nothing lasts forever, and yet, in memory, everything keeps beating. 🌙💫",
    },
  },
  6: {
    es: {
      title: "¿Cuál es el mejor consejo que has recibido?",
      content:
        "Eres lo que piensas. En lo que piensas, te conviertes.\nLos pensamientos llevan a acciones.\nLas acciones, a comportamientos.\nLos comportamientos, al estilo de vida.\nY el estilo de vida define tu destino.\nTodo empieza en la mente. Si controlas tu mente, determinas tu destino.",
    },
    en: {
      title: "What is the best advice you have ever received?",
      content:
        "You are what you think. What you think, you become.\nThoughts lead to actions.\nActions lead to behaviors.\nBehaviors lead to a lifestyle.\nAnd your lifestyle defines your destiny.\nEverything begins in the mind. If you master your mind, you determine your destiny.",
    },
  },
  7: {
    es: {
      title: "Comerás polvo",
      content:
        "Antes de reinar comerás polvo. Antes de que te paguen mucho, tendrás que hacer mucho más de lo que te pagan por menos de lo que valen tus talentos. Antes de vender tu arte, serás vendido por tus amigos. Antes de amar, serás traicionado. Antes de que te descubras, andarás perdiendo. Antes de recibir un beso, recibirás un puñal en el pecho. Antes de ser oasis, serás un desierto. Antes de ser trueno, serás solo lluvia, y antes de sentirte vivo, te sentirás muerto. Antes de conocer a Dios, conocerás el mal. Antes de ser grande, serás el más pequeño de tu tribu. Antes de ser todo, vivirás con nada. Antes de amar tus sueños, aprende a amar tus heridas. Antes de rugir, temerás en la oscura selva. Antes de volar, caminarás con los que se arrastran, porque para que una estrella nazca, primero debe explotar. Sin implosión no hay luz, sin quebrantamientos no hay sabiduría.",
    },
    en: {
      title: "You will eat dust",
      content:
        "Before you reign, you will eat dust. Before you are paid well, you will have to do far more than you are paid for, for far less than your talents are worth. Before you sell your art, you will be betrayed by friends. Before you love, you will be heartbroken. Before you find yourself, you will wander lost. Before you receive a kiss, you will take a dagger to the chest. Before you become an oasis, you will be a desert. Before you become thunder, you will only be rain, and before you feel alive, you will feel broken. Before you know God, you will know darkness. Before you are great, you will be the smallest in your tribe. Before you have everything, you will live with nothing. Before you love your dreams, learn to love your scars. Before you roar, you will tremble in the dark jungle. Before you fly, you will walk among those who crawl—because for a star to be born, it must first explode. Without implosion there is no light; without brokenness there is no wisdom.",
    },
  },
  8: {
    es: {
      title: "Lo vivido en un suspiro",
      content: "Nos dimos el lujo de vivir lo que nunca vivimos; no hubo futuro, pero hubo verdad.",
    },
    en: {
      title: "Lived in a single breath",
      content: "We gave ourselves the luxury of living what we had never lived; there was no future, but there was truth.",
    },
  },
  9: {
    es: {
      title: "Rue Vieille Du Temple",
      content:
        "Te vas borrando con la multitud\nPuedo ver los puntitos contra el cielo \nY cuando aprieto los ojos veo tu voz \nFantástica, geométrica, multicolor.\n\nY es cuando tú, me miras desde allá \nY sonriéndome me regresas hacia ti \nConoces bien\nMi habilidad de volar \nDe divagar",
    },
    en: {
      title: "Rue Vieille Du Temple",
      content:
        "You fade away into the crowd\nI can see little dots against the sky\nAnd when I squeeze my eyes shut I see your voice\nFantastic, geometric, multicolored.\n\nAnd that is when you look at me from afar\nAnd smiling, bring me back toward you\nYou know so well\nMy ability to fly\nTo wander",
    },
  },
  10: {
    es: {
      title: "Amar sin traducción",
      content:
        "Amo en un idioma que no todos entienden.\nNo es ternura.\nNo es lujuria.\nTampoco es interés.\nCuando amo de verdad, no lo hago por los ojos, sino desde el alma.\nDesde lo invisible, desde lo que no se dice,\nPero se siente.\n\nAmo en los silencios, en los gestos pequeños, en las veces que me quedo aunque podría irme.\n\nAmo con paciencia, aunque me duela esperar.\nPorque cuando amo, no me importa que el tiempo corra, yo no lo corro.\nMenos aún, cuando mis ojos solo saben mirar a una persona.\n\nNo soy de amar fácil, ni de sentir a medias.\nPero cuando amo, me vuelvo blanda.\nPienso en el amor todo el día, en cómo cuidarlo, en cómo no soltarlo.\n\nNo necesito que todos lo entiendan.\nSolo que alguien pueda quedarse, sin tenerle miedo\na cómo amo yo.\n\n.-Luciana perpeto",
    },
    en: {
      title: "Loving without translation",
      content:
        "I love in a language not everyone understands.\nIt is not mere tenderness.\nIt is not lust.\nNor is it self-interest.\nWhen I truly love, I do not do it through the eyes, but from the soul.\nFrom the invisible, from what is left unsaid,\nYet deeply felt.\n\nI love in the silences, in the small gestures, in the times I stay even when I could leave.\n\nI love with patience, even when waiting hurts.\nBecause when I love, I don't care if time rushes by—I do not rush it.\nEven less so when my eyes only know how to look at one person.\n\nI am not one to love easily, nor to feel halfway.\nBut when I love, I soften.\nI think about love all day—how to care for it, how not to let it go.\n\nI don't need everyone to understand it.\nOnly for someone to stay, unafraid\nof the way I love.\n\n— Luciana Perpeto",
    },
  },
  11: {
    es: {
      title: "Los ojos perfectos",
      content:
        "Reza siempre por tener\nojos que vean lo mejor en las personas,\nun corazón que perdone lo peor,\nuna mente que olvide lo malo,\ny un alma que nunca pierda la fe en Dios.",
    },
    en: {
      title: "The perfect eyes",
      content:
        "Always pray to have\nEyes that see the\nbest in people,\nA heart that forgives\nthe worst,\nA mind that forgets\nthe bad.\nAnd a soul that never loses faith in God.",
    },
  },
  12: {
    es: {
      title: "Amor, amor, amor",
      content:
        "La intimidad que infringen las palabras y las miradas cuando hallan silencio y vacío en el cuestionamiento del ser o no ser, del decir o no decir, advierte la corrupción misma del sentir por el razonamiento.\nLa febrilidad que trasciende del\npensamiento como sustituto del sentir es lo que termina por enfermar al hombre cuando trata de hallar sentido y razón al amor, porque el amor encuentra su dominación en el cuestionamiento y no en su sensibilidad primaria, es decir, en sus sentidos.\nEn este aforismo terminé siendo esclava de nociones que limitaron mi condición humana. Subordinada a la problematización del afecto que sentía desmedidamente por él, caí bajo el embrujo de Ícaro: quien, ambicionado por comprender al sol y alcanzarlo, cayó.\nEl sol hace una broma de todo poeta que intenta escribir una narrativa de él, porque el sol está para cautivar nuestras almas gentiles en el día y para extrañarse por las noches, no para entenderse ni explicarse.\n.-Ximena Carreola",
    },
    en: {
      title: "Love, love, love",
      content:
        "The intimacy breached by words and glances when they meet silence and emptiness in the question of to be or not to be, to speak or not to speak, warns of the very corruption of feeling by reason.\nThe feverishness that transcends thought as a substitute for feeling is what ultimately sickens humanity when trying to find logic and reason in love—because love finds its undoing in interrogation rather than in its primary sensibility: the senses.\nIn this aphorism I became captive to notions that limited my human condition. Subordinated to over-analyzing the boundless affection I felt, I fell under the spell of Icarus: who, driven by ambition to comprehend and reach the sun, fell.\nThe sun makes a jest of every poet who tries to write a narrative about it, because the sun exists to captivate our gentle souls by day and to be missed by night—not to be understood or explained.\n— Ximena Carreola",
    },
  },
  13: {
    es: {
      title: "Bajo la misma estrella",
      content:
        "Estoy enamorado de ti, \ny no me apetece privarme del sencillo placer de decir la verdad. \nEstoy enamorado de ti y sé que el amor es sólo un grito al vacío, \nque es inevitable el olvido, \nque estamos todos condenados y que llegará el día en que todos nuestros esfuerzos volverán al polvo.",
    },
    en: {
      title: "The Fault in Our Stars",
      content:
        "I am in love with you,\nand I am not in the business of denying myself the simple pleasure of saying true things.\nI am in love with you, and I know that love is just a shout into the void,\nand that oblivion is inevitable,\nand that we're all doomed and that there will come a day when all our labor has been returned to dust.",
    },
  },
  14: {
    es: {
      title: "Poema 20",
      content:
        "PUEDO escribir los versos más tristes esta noche.\n\nEscribir, por ejemplo: \"La noche está estrellada,\ny tiritan, azules, los astros, a lo lejos\".\n\nEl viento de la noche gira en el cielo y canta.\n\nPuedo escribir los versos más tristes esta noche.\nYo la quise, y a veces ella también me quiso.\n\nEn las noches como ésta la tuve entre mis brazos.\nLa besé tantas veces bajo el cielo infinito.\n\nElla me quiso, a veces yo también la quería.\nCómo no haber amado sus grandes ojos fijos.\n\nPuedo escribir los versos más tristes esta noche.\nPensar que no la tengo. Sentir que la he perdido.\n\nOír la noche inmensa, más inmensa sin ella.\nY el verso cae al alma como al pasto el rocío.\n\nQué importa que mi amor no pudiera guardarla.\nLa noche está estrellada y ella no está conmigo.\n\nEso es todo. A lo lejos alguien canta. A lo lejos.\nMi alma no se contenta con haberla perdido.\n\nComo para acercarla mi mirada la busca.\nMi corazón la busca, y ella no está conmigo.\n\nLa misma noche que hace blanquear los mismos\n           árboles.\nNosotros, los de entonces, ya no somos los mismos.\n\nYa no la quiero, es cierto, pero cuánto la quise.\nMi voz buscaba el viento para tocar su oído.\n\nDe otro. Será de otro. Como antes de mis besos.\nSu voz, su cuerpo claro. Sus ojos infinitos.\n\nYa no la quiero, es cierto, pero tal vez la quiero.\nEs tan corto el amor, y es tan largo el olvido.\n\nPorque en noches como ésta la tuve entre mis\n          brazos,\nmi alma no se contenta con haberla perdido.\n\nAunque éste sea el último dolor que ella me causa,\ny éstos sean los últimos versos que yo le escribo.\n\n.- Pablo Neruda",
    },
    en: {
      title: "Poem 20 (Tonight I Can Write)",
      content:
        "TONIGHT I can write the saddest lines.\n\nWrite, for example, \"The night is starry\nand the stars are blue and shiver in the distance.\"\n\nThe night wind revolves in the sky and sings.\n\nTonight I can write the saddest lines.\nI loved her, and sometimes she loved me too.\n\nThrough nights like this one I held her in my arms.\nI kissed her again and again under the endless sky.\n\nShe loved me, sometimes I loved her too.\nHow could one not have loved her great still eyes.\n\nTonight I can write the saddest lines.\nTo think that I do not have her. To feel that I have lost her.\n\nTo hear the immense night, still more immense without her.\nAnd the verse falls to the soul like dew to the pasture.\n\nWhat does it matter that my love could not keep her.\nThe night is starry and she is not with me.\n\nThis is all. In the distance someone is singing. In the distance.\nMy soul is not satisfied that it has lost her.\n\nMy sight tries to find her as though to bring her closer.\nMy heart looks for her, and she is not with me.\n\nThe same night whitening the same trees.\nWe, of that time, are no longer the same.\n\nI no longer love her, that's certain, but how I loved her.\nMy voice tried to find the wind to touch her hearing.\n\nAnother's. She will be another's. As she was before my kisses.\nHer voice, her bright body. Her infinite eyes.\n\nI no longer love her, that's certain, but maybe I love her.\nLove is so short, forgetting is so long.\n\nBecause through nights like this one I held her in my arms\nmy soul is not satisfied that it has lost her.\n\nThough this be the last pain that she makes me suffer\nand these the last verses that I write for her.\n\n— Pablo Neruda",
    },
  },
  15: {
    es: {
      title: "La imaginación es una piedra",
      content:
        "La noche dicta al oído\nque la vida y la muerte no tienen sentido\nson sólo golpes en el teclado del universo\n\nque la imaginación es una piedra \npara romper los espejos del miedo",
    },
    en: {
      title: "Imagination is a stone",
      content:
        "The night whispers into the ear\nthat life and death have no fixed meaning—\nthey are only keystrokes on the keyboard of the universe,\n\nand imagination is a stone\nto shatter the mirrors of fear.",
    },
  },
  16: {
    es: {
      title: "Entre el mar y la balanza",
      content:
        "Sabes, estaba pensando hace un momento que tú eres como el mar…\nAunque no, esto no es una carta de amor; es una carta de negocios.\nIntento resolver lo nuestro: lo tuyo y lo mío, de modo que ambos tengamos algo que ganar. Yo, quizá, más que tú; porque yo te gano a ti. Tú, en cambio, solo obtendrás a este muchacho desorientado —no tanto, en realidad—, pero profundamente enfermo de amor por ti.",
    },
    en: {
      title: "Between the sea and the scales",
      content:
        "You know, I was thinking just a moment ago that you are like the sea…\nAlthough no, this isn't a love letter; it's a business letter.\nI'm trying to work out our arrangement—yours and mine—so that we both have something to gain. I, perhaps, more than you, because I gain you. You, in return, will only get this slightly disoriented young man—not that disoriented, really—yet deeply lovesick for you.",
    },
  },
  17: {
    es: {
      title: "Un año inolvidable. Último día del año.",
      content:
        "Sin duda, un 2025 que nunca olvidaré. Un año colmado de experiencias que, en algún punto de mi vida, imaginé que algún día viviría y que hoy puedo decir, con certeza, que este 2025 me concedió.\n\nEste 31 de diciembre de 2025, a la 1:58 a. m., acepto con amor y con conciencia todo lo que viví y experimenté. Me abrazo, me reconozco y me entrego amor, con la intención de que este se difunda, porque sin duda lo más importante es hacerlo todo desde el amor.\n\nAbrazo y agradezco profundamente la presencia de mis padres y mi hermana; de mis abuelos y abuelas, mis pilares, mi sostén, mi cincuenta por ciento. Con el mismo amor, agradezco a esa persona que se convirtió en el amor de mi vida y que representa mi veinticinco por ciento.\n\nGracias, vida, por lo vivido, por lo aprendido y por lo que aún está por florecer. Hoy cierro este año con el corazón lleno, confiando en que todo lo que viene también sabrá encontrarme desde el amor.",
    },
    en: {
      title: "An unforgettable year. Last day of the year.",
      content:
        "Without a doubt, a 2025 I will never forget. A year filled with experiences that, at some point in my life, I imagined I would one day live—and today I can say with certainty that 2025 granted them to me.\n\nOn this December 31st, 2025, at 1:58 a.m., I accept with love and awareness everything I lived and experienced. I embrace myself, recognize myself, and give myself love, with the intention that it radiates outward—because without a doubt the most important thing is to do everything from a place of love.\n\nI deeply embrace and thank my parents and my sister; my grandfathers and grandmothers—my pillars, my foundation, my fifty percent. With the same love, I thank that special person who became the love of my life and represents my twenty-five percent.\n\nThank you, life, for what was lived, for what was learned, and for what is still to bloom. Today I close this year with a full heart, trusting that everything ahead will also find me through love.",
    },
  },
  18: {
    es: {
      title: "Un mundo absurdo",
      content:
        "Llegaba un incesante caudal de ideas, y lo más difícil era atraparlas con rapidez. \n\nNikola Tesla",
    },
    en: {
      title: "An absurd world",
      content:
        "An incessant stream of ideas kept arriving, and the hardest part was catching them fast enough.\n\n— Nikola Tesla",
    },
  },
  19: {
    es: {
      title: "Te amo…",
      content:
        "Te amo cuando despierto y lo primero que hago es pensarte, te amo cuando pasan las horas y sigues siendo mi pensamiento favorito, te amo cuando te extraño, cuando te siento cerca aunque estés lejos, te amo cuando sonrío sin darme cuenta, te amo cuando el mundo se pone difícil y eres mi calma, te amo cuando todo va bien y también cuando todo se cae, te amo en mis silencios, te amo en mis palabras, te amo en lo que digo y en lo que no sé explicar, te amo en cada versión de mí, te amo hoy, te amo mañana, te amo incluso en los días en que no sé cómo amar... porque amarte no es una opción, es mi manera de existir.",
    },
    en: {
      title: "I love you…",
      content:
        "I love you when I wake up and the first thing I do is think of you; I love you as the hours pass and you remain my favorite thought; I love you when I miss you, when I feel you close even when you are far away; I love you when I smile without realizing it; I love you when the world gets hard and you are my calm; I love you when everything goes well and also when everything falls apart; I love you in my silences, I love you in my words, I love you in what I say and in what I don't know how to explain; I love you in every version of myself; I love you today, I love you tomorrow, I love you even on the days when I don't know how to love... because loving you is not an option, it is my way of existing.",
    },
  },
  20: {
    es: {
      title: "Lo más importante, el amor",
      content:
        "Los días sin amar son días desperdiciados.\n\nEntre vacíos de lo escrito, la falta de atención es un grito.\nLos besos que perdimos por no saber decirnos\n\nun simple: te necesito.",
    },
    en: {
      title: "The most important thing: love",
      content:
        "Days without loving are wasted days.\n\nBetween the voids of what is written, silence is a cry—\nthe kisses we lost for not knowing how to say to each other\n\na simple: I need you.",
    },
  },
};

export function localizeBlogPost(post, language = "es") {
  if (!post || typeof post !== "object") return post;
  const isSpanish = String(language || "es").toLowerCase().startsWith("es");
  const langKey = isSpanish ? "es" : "en";

  // 1. Check explicit bilingual fields on the record (if present in DB)
  if (post[`title_${langKey}`] || post[`content_${langKey}`]) {
    return {
      ...post,
      title: post[`title_${langKey}`] || post.title,
      content: post[`content_${langKey}`] || post.content,
    };
  }

  // 2. Match known blog post ID
  const mapped = BLOG_TRANSLATIONS[Number(post.id)]?.[langKey];
  if (mapped) {
    return {
      ...post,
      title: mapped.title,
      content: mapped.content,
    };
  }

  return post;
}

export default localizeBlogPost;
