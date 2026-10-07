
export const GAMES = [
  {id:"valheim", title:"Valheim", appId:892970, genre:"Survival · Sandbox", party:["solo","duo","group"], time:["medium","long"], mood:["survive","build","explore"], blurb:"Исследуйте огромный мир, стройте базы и готовьтесь к боссам — идеально для долгого совместного вечера."},
  {id:"zomboid", title:"Project Zomboid", appId:108600, genre:"Survival · Sandbox", party:["solo","duo","group"], time:["medium","long"], mood:["survive","suffer","laugh"], blurb:"Медленное, нервное выживание, где даже поход за консервами превращается в отдельную историю."},
  {id:"stardew", title:"Stardew Valley", appId:413150, genre:"Cozy · Farming", party:["solo","duo","group"], time:["quick","medium","long"], mood:["relax","build","explore"], blurb:"Спокойный вечер: ферма, шахты, рыбалка и бесконечное «ещё один игровой день — и выходим»."},
  {id:"terraria", title:"Terraria", appId:105600, genre:"Sandbox · Adventure", party:["solo","duo","group"], time:["medium","long"], mood:["explore","build","survive"], blurb:"Стройка, исследование и боссы — хороший вариант, когда хочется много свободы и общей цели."},
  {id:"lethal", title:"Lethal Company", appId:1966720, genre:"Co-op · Horror", party:["duo","group"], time:["quick","medium"], mood:["laugh","suffer","survive"], blurb:"Короткие напряжённые забеги, которые почти всегда заканчиваются чем-то очень глупым и смешным."},
  {id:"dst", title:"Don't Starve Together", appId:322330, genre:"Survival · Co-op", party:["duo","group"], time:["medium","long"], mood:["survive","build","suffer"], blurb:"Выживание с характером: исследование, база и достаточно хаоса, чтобы было что обсуждать в Discord."},
  {id:"phasmo", title:"Phasmophobia", appId:739630, genre:"Horror · Co-op", party:["duo","group"], time:["quick","medium"], mood:["suffer","laugh","explore"], blurb:"Если хочется хоррора, общения и коллективного крика из соседней комнаты."},
  {id:"drg", title:"Deep Rock Galactic", appId:548430, genre:"Co-op · Action", party:["solo","duo","group"], time:["quick","medium"], mood:["laugh","explore","survive"], blurb:"Миссии на один вечер, понятная общая цель и очень приятный кооперативный ритм."}
];

export const coverUrl = appId =>
  appId ? `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg` : "";

export const normalizeLibraryGame = game => {
  const known = GAMES.find(item => item.id === game.id || (game.appId && item.appId === Number(game.appId)));
  if (known) return {...known, ...game};

  return {
    id: game.id,
    title: game.title,
    appId: game.appId ? Number(game.appId) : null,
    gameID: game.gameID ?? null,
    thumb: game.thumb ?? "",
    genre: game.genre || "Из твоей библиотеки",
    party: Array.isArray(game.party) ? game.party : ["solo","duo","group"],
    time: Array.isArray(game.time) ? game.time : ["quick","medium","long"],
    mood: Array.isArray(game.mood) ? game.mood : [],
    blurb: game.blurb || "Эта игра добавлена в твою библиотеку через поиск. Можно оставить её здесь и выбрать для следующего вечера.",
    source: game.source || "local"
  };
};

export const gameImage = game =>
  coverUrl(game.appId) || game.thumb || "";
