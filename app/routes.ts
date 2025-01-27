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
    cat: "math",
    slug: "number",
    title: "Base Conversion",
    desc: "Convert number base",
  },
];

function getMeta(cat: string, slug: string) {
  const route = routes.filter(
    (route) => route.cat === cat && route.slug === slug
  )[0];
  return [
    { title: `${route.title} | /${cat}/${slug}` },
    {
      name: "description",
      content: route.desc,
    },
  ];
}

function getTitle(cat: string, slug: string) {
  const route = routes.filter(
    (route) => route.cat === cat && route.slug === slug
  )[0];
  return route.title;
}

export { routes, getMeta, getTitle, type ToolRoot };
