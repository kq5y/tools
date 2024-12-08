interface ToolRoot {
  cat: string;
  title: string;
  desc: string;
  hidden?: boolean;
}

const routes: ToolRoot[] = [
  {
    cat: "crypto",
    title: "caesar",
    desc: "Caesar Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    title: "vigenere",
    desc: "Vigenere Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    title: "rail-fence",
    desc: "Rail-Fence Cipher Encryption and Decryption",
  },
  {
    cat: "crypto",
    title: "substitution",
    desc: "Helping to decipher substitutions",
  },
  {
    cat: "crypto",
    title: "morse",
    desc: "Morse Code Encryption and Decryption",
  },
  {
    cat: "school",
    title: "dakoku",
    desc: "Lecture attendance management",
  },
  {
    cat: "automata",
    title: "simplest",
    desc: "Convert the DFA to the simplest DFA",
  },
  {
    cat: "automata",
    title: "typst",
    desc: "Convert to automata notation on Typst",
  },
  {
    cat: "automata",
    title: "nfa2dfa",
    desc: "Convert the NFA to the DFA",
  },
];

function getMeta(cat: string, title: string) {
  return [
    { title: `/${cat}/${title}` },
    {
      name: "description",
      content: routes.filter(
        (route) => route.cat === cat && route.title === title
      )[0].desc,
    },
  ];
}

export { routes, getMeta, type ToolRoot };
