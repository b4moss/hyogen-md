/* Generated from highlighter/dsl — do not edit by hand. */
/** @type {(hljs: any) => any} */
export default function hyogen(hljs) {
  return {
    name: "hyogen",
    aliases: ["hg"],
    keywords: {
      keyword: "if else endif const let for do while each endeach block endblock extend include component as echo else if toc",
    },
    contains: [
      hljs.COMMENT("//", /$/),
      hljs.COMMENT(
        "/*",
        "*/",
      ),
      {
        className: "meta",
        begin: /@(?:hg\b|endhg\b)|@@/,
      },
      hljs.QUOTE_STRING_MODE,
      hljs.APOS_STRING_MODE,
      hljs.C_NUMBER_MODE,
      {
        className: "operator",
        begin: /\|\||&&|==|!=|<=|>=|\+\+|--|\+=|-=|\*=|/=|\||\+|-|\*|/|%|<|>|!|\?|:|=|\./,
      },
    ],
  };
}
