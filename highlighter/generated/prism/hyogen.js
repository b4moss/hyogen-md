/* Generated from highlighter/dsl — do not edit by hand. */
(function (Prism) {
  Prism.languages.hyogen = {
    comment: [
      { pattern: ///.*/, greedy: true },
      { pattern: //\*[\s\S]*?\*//, greedy: true },
    ],
    marker: { pattern: /@hg\b|@endhg\b|@@/, alias: "keyword" },
    string: {
      pattern: /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|`(?:\\.|[^\\`])*`/,
      greedy: true,
    },
    number: /\b\d+(?:\.\d+)?\b/,
    keyword: /\b(?:component|endblock|endeach|include|else\s+if|extend|endif|const|while|block|else|each|echo|let|for|toc|if|do|as)\b/,
    operator: /\|\||&&|==|!=|<=|>=|\+\+|--|\+=|-=|\*=|/=|\||\+|-|\*|/|%|<|>|!|\?|:|=|\./,
    punctuation: /[\(\)\[\]\{\},;]/,
  };
})(typeof Prism !== "undefined" ? Prism : { languages: {} });
