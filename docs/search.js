(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DocSearch = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var HEADING_RE = /^\s*#{1,6}\s*/;
  var SNIPPET_LEN = 180;

  function deriveTitle(text) {
    var firstLine = text;
    var nl = text.indexOf('\n');
    if (nl !== -1) firstLine = text.slice(0, nl);
    var title = firstLine.replace(HEADING_RE, '').trim();
    return title || firstLine.trim();
  }

  function buildIndex(chapters, sections) {
    if (!Array.isArray(sections)) sections = [];
    if (!Array.isArray(chapters)) chapters = [];

    // Map sectionNumber -> chapter metadata, preserving the first mapping.
    var chapterOf = Object.create(null);
    var mapped = [];

    for (var c = 0; c < chapters.length; c++) {
      var ch = chapters[c];
      if (!Array.isArray(ch)) continue;
      var routeId = ch[0];
      var label = ch[1];
      var nums = ch[3];
      if (!Array.isArray(nums)) continue;
      var chapterTitle = typeof label === 'string' ? label : String(label == null ? '' : label);

      for (var n = 0; n < nums.length; n++) {
        var num = nums[n];
        if (typeof num !== 'number' || !isFinite(num)) continue;
        if (num < 0 || Math.floor(num) !== num) continue;
        if (Object.prototype.hasOwnProperty.call(chapterOf, num)) continue;
        chapterOf[num] = { routeId: routeId, chapterTitle: chapterTitle };
        mapped.push(num);
      }
    }

    mapped.sort(function (a, b) { return a - b; });

    var result = [];
    for (var m = 0; m < mapped.length; m++) {
      var sectionNumber = mapped[m];
      var text = sections[sectionNumber];
      if (typeof text !== 'string' || text.length === 0) continue;
      var meta = chapterOf[sectionNumber];
      result.push({
        sectionNumber: sectionNumber,
        routeId: meta.routeId,
        chapterTitle: meta.chapterTitle,
        title: deriveTitle(text),
        text: text
      });
    }
    return result;
  }

  function clampLimit(limit) {
    if (typeof limit !== 'number' || !isFinite(limit)) return 20;
    limit = Math.floor(limit);
    if (limit < 1) return 1;
    if (limit > 50) return 50;
    return limit;
  }

  function splitTerms(query) {
    var trimmed = query.trim();
    if (!trimmed) return [];
    var parts = trimmed.split(/\s+/);
    var terms = [];
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].length > 0) terms.push(parts[i].toLowerCase());
    }
    return terms;
  }

  function countOccurrences(haystackLower, needleLower) {
    if (!needleLower) return 0;
    var count = 0;
    var pos = 0;
    while (true) {
      var idx = haystackLower.indexOf(needleLower, pos);
      if (idx === -1) break;
      count++;
      pos = idx + needleLower.length;
    }
    return count;
  }

  function makeSnippet(text, firstIndex, firstLen) {
    if (text.length <= SNIPPET_LEN) return text;

    var start = firstIndex;
    var end = firstIndex + firstLen;
    var span = end - start;

    var left = Math.floor((SNIPPET_LEN - span) / 2);
    if (left < 0) left = 0;

    var from = start - left;
    if (from < 0) from = 0;
    var to = from + SNIPPET_LEN;
    if (to > text.length) {
      to = text.length;
      from = to - SNIPPET_LEN;
      if (from < 0) from = 0;
    }
    return text.slice(from, to);
  }

  function search(index, query, limit) {
    if (typeof query !== 'string') return [];
    var terms = splitTerms(query);
    if (terms.length === 0) return [];
    if (!Array.isArray(index) || index.length === 0) return [];

    var max = clampLimit(limit);
    var results = [];

    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      if (!entry || typeof entry.text !== 'string') continue;

      var textLower = entry.text.toLowerCase();
      var titleLower = typeof entry.title === 'string' ? entry.title.toLowerCase() : '';

      var allPresent = true;
      var matches = 0;
      var firstIndex = -1;
      var firstLen = 0;

      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        var textCount = countOccurrences(textLower, term);
        if (textCount === 0) {
          allPresent = false;
          break;
        }
        matches += textCount;

        var idx = textLower.indexOf(term);
        if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
          firstIndex = idx;
          firstLen = term.length;
        }
      }

      if (!allPresent) continue;

      var titleMatched = false;
      for (var u = 0; u < terms.length; u++) {
        if (titleLower.indexOf(terms[u]) !== -1) {
          titleMatched = true;
          break;
        }
      }

      var snippet = firstIndex === -1
        ? (entry.text.length > SNIPPET_LEN ? entry.text.slice(0, SNIPPET_LEN) : entry.text)
        : makeSnippet(entry.text, firstIndex, firstLen);

      results.push({
        sectionNumber: entry.sectionNumber,
        routeId: entry.routeId,
        chapterTitle: entry.chapterTitle,
        title: entry.title,
        text: entry.text,
        snippet: snippet,
        matches: matches,
        _titleMatched: titleMatched
      });
    }

    results.sort(function (a, b) {
      if (a._titleMatched !== b._titleMatched) return a._titleMatched ? -1 : 1;
      if (b.matches !== a.matches) return b.matches - a.matches;
      return a.sectionNumber - b.sectionNumber;
    });

    var out = [];
    for (var r = 0; r < results.length && r < max; r++) {
      var item = results[r];
      out.push({
        sectionNumber: item.sectionNumber,
        routeId: item.routeId,
        chapterTitle: item.chapterTitle,
        title: item.title,
        text: item.text,
        snippet: item.snippet,
        matches: item.matches
      });
    }
    return out;
  }

  return {
    buildIndex: buildIndex,
    search: search
  };
});