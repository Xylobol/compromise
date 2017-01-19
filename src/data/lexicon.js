'use strict';
//a lexicon is a giant object of known words
const data = require('./index');
const fns = require('./fns');
const fastConjugate = require('../term/verb/conjugate/faster');
const toPlural = require('../term/noun/inflect/toPlural');
const adj = {
  toNoun: require('../term/adjective/toNoun'),
  toSuperlative: require('../term/adjective/toSuperlative'),
  toComparative: require('../term/adjective/toComparative'),
  toAdverb: require('../term/adjective/toAdverb'),
  toVerb: require('../term/adjective/toVerb')
};

// console.time('lexicon');
let lexicon = {};

const addObj = (o) => {
  fns.extendObj(lexicon, o);
};
const addArr = (arr, tag) => {
  const l = arr.length;
  // console.log('----' + tag);
  for (let i = 0; i < l; i++) {
    // if (lexicon[arr[i]]) {
    //   console.log(arr[i]);
    // }
    lexicon[arr[i]] = tag;
  }
};

//let a rip
let units = data.units.words.filter((s) => s.length > 1);
addArr(units, 'Unit');
addArr(data.dates.durations, 'Duration');

addObj(data.abbreviations);
//number-words are well-structured
let obj = data.numbers.ordinal;
addArr(Object.keys(obj.ones), 'Ordinal');
addArr(Object.keys(obj.teens), 'Ordinal');
addArr(Object.keys(obj.tens), 'Ordinal');
addArr(Object.keys(obj.multiples), 'Ordinal');
obj = data.numbers.cardinal;
addArr(Object.keys(obj.ones), 'Cardinal');
addArr(Object.keys(obj.teens), 'Cardinal');
addArr(Object.keys(obj.tens), 'Cardinal');
addArr(Object.keys(obj.multiples), 'Cardinal');
addArr(Object.keys(data.numbers.prefixes), 'Cardinal');
//singular/plural
addArr(Object.keys(data.irregular_plurals.toPlural), 'Singular');
addArr(Object.keys(data.irregular_plurals.toSingle), 'Plural');

//dates are well-structured
addArr(data.dates.days, 'WeekDay');
addArr(data.dates.months, 'Month');
addArr(data.dates.relative, 'RelativeDay');
addArr(data.holidays, 'Holiday');

addArr(data.professions, 'Actor'); //?
addArr(data.demonyms, 'Demonym');
addArr(data.sportsTeams, 'SportsTeam');
addArr(data.bands, 'Organization');
addArr(data.orgWords, 'Noun');

//irregular verbs
Object.keys(data.irregular_verbs).forEach((k) => {
  lexicon[k] = 'Infinitive';
  let conj = data.irregular_verbs[k];
  Object.keys(conj).forEach((k2) => {
    if (conj[k2]) {
      lexicon[conj[k2]] = k2;
    }
  });
});

//conjugate verblist
const wantVerbs = [
  'PastTense',
  'PresentTense',
  'Infinitive',
  'Gerund',
  'Actor',
  'Adjective'
];
data.verbs.forEach((v) => {
  let o = fastConjugate(v);
  wantVerbs.forEach((k) => {
    if (o[k] && !lexicon[o[k]]) {
      lexicon[o[k]] = k;
    }
  });
});

//conjugate adjectives
data.superlatives.forEach((a) => {
  lexicon[adj.toNoun(a)] = 'Noun';
  lexicon[adj.toAdverb(a)] = 'Adverb';
  lexicon[adj.toSuperlative(a)] = 'Superlative';
  lexicon[adj.toComparative(a)] = 'Comparative';
});

data.verbConverts.forEach((a) => {
  lexicon[adj.toNoun(a)] = 'Noun';
  lexicon[adj.toAdverb(a)] = 'Adverb';
  lexicon[adj.toSuperlative(a)] = 'Superlative';
  lexicon[adj.toComparative(a)] = 'Comparative';

  const v = adj.toVerb(a);
  lexicon[v] = 'Verb';
  //now conjugate it
  let o = fastConjugate(v);
  wantVerbs.forEach((k) => {
    if (o[k] && !lexicon[o[k]]) {
      lexicon[o[k]] = k;
    }
  });
});

//inflect nouns
data.nouns.forEach((n) => {
  lexicon[n] = 'Singular';
  let plural = toPlural(n);
  lexicon[plural] = 'Plural';
});

//let a rip.
addObj(data.firstnames);
addArr(data.notable_people.female, 'FemaleName');
addArr(data.notable_people.male, 'MaleName');
addArr(data.lastnames, 'LastName');
addArr(data.places.airports, 'Place');
addArr(data.places.cities, 'City');
addArr(data.places.countries, 'Country');
addArr(data.uncountables, 'Noun');
addArr(data.organizations, 'Organization');
addArr(data.adjectives, 'Adjective');
addArr(data.verbConverts, 'Adjective');
addArr(data.superlatives, 'Adjective');
addArr(data.currencies, 'Currency');
//these ad-hoc manual ones have priority
addObj(data.misc);


//for safety (these are sneaky)
delete lexicon[''];
delete lexicon[' '];
delete lexicon[null];
module.exports = lexicon;

// console.log(lexicon['stiffened']);
// let t = new Term('shake');
// t.tag.Verb = true;
// console.log(t.verb.conjugate())
// console.timeEnd('lexicon');
