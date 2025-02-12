interface ToolRoot {
  cat: string;
  slug: string;
  title: string;
  desc: string;
  hidden?: boolean;
}

const routes: ToolRoot[] = [
  {
    cat: "crypto",
    slug: "caesar",
    title: "Caesar Cipher",
    desc: "Caesar Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    slug: "vigenere",
    title: "Vigenere Cipher",
    desc: "Vigenere Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    slug: "rail-fence",
    title: "Rail-Fence Cipher",
    desc: "Rail-Fence Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    slug: "substitution",
    title: "Substitution Support",
    desc: "Helping to decipher substitutions",
  },
  {
    cat: "crypto",
    slug: "morse",
    title: "Morse Code",
    desc: "Morse Code Encryption and Decryption",
  },
  {
    cat: "school",
    slug: "dakoku",
    title: "Dakoku",
    desc: "Lecture attendance management",
  },
  {
    cat: "automata",
    slug: "simplest",
    title: "Simplest DFA",
    desc: "Convert the DFA to the simplest DFA",
  },
  {
    cat: "automata",
    slug: "nfa2dfa",
    title: "NFA to DFA",
    desc: "Convert the NFA to the DFA",
  },
  {
    cat: "automata",
    slug: "typst",
    title: "Typst Automata",
    desc: "Convert to automata notation on Typst",
  },
  {
    cat: "simulation",
    slug: "ant",
    title: "Langton's Ant",
    desc: "Langton's Ant Simulation",
  },
  {
    cat: "simulation",
    slug: "sorting",
    title: "Sorting Simulation",
    desc: "Visualization of sorting algorithms",
  },
  {
    cat: "misc",
    slug: "number",
    title: "Base Conversion",
    desc: "Convert number base",
  },
  {
    cat: "misc",
    slug: "count",
    title: "Character Count",
    desc: "Count the number of characters",
  },
];

function getMeta(cat: string, slug: string) {
  const route = routes.filter(
    (route) => route.cat === cat && route.slug === slug
  )[0];
  const ogImageUrl = `https://ogp.t3x.jp/tools/image.png?cat=${cat}&slug=${slug}&title=${encodeURIComponent(route.title)}`;
  return [
    { title: `${route.title} | Tools` },
    {
      name: "description",
      content: route.desc,
    },
    { property: "og:image", content: ogImageUrl },
    { property: "og:title", content: `${route.title} | Tools` },
    { property: "og:description", content: route.desc },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${route.title} | Tools` },
    { name: "twitter:description", content: route.desc },
    { name: "twitter:image", content: ogImageUrl },
  ];
}

function getTitle(cat: string, slug: string): string | null {
  const route = routes.filter(
    (route) => route.cat === cat && route.slug === slug
  );
  return route.length === 0 ? null : route[0].title;
}

export { routes, getMeta, getTitle, type ToolRoot };
