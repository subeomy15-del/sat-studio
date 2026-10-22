export const chapters={
 boundaries:{
  title:'See the sentence beneath the sentence.',subtitle:'Fragments, run-ons, and the boundaries between ideas.',minutes:12,
  objective:'Identify independent clauses even when relative clauses, modifiers, and transitions make the sentence look longer than it is.',
  sections:[
   ['Start with the spine','A sentence’s spine is its main subject and finite verb. “The discovery changed the timeline” has a complete spine. In “The discovery that changed the timeline,” the verb changed belongs to the clause beginning with that; the main subject discovery still needs a predicate. Length and sophistication do not make a fragment complete.'],
   ['Classify both sides before choosing punctuation','Read the material on either side of the blank. Label a complete clause I and an incomplete unit D. I + I can be joined with a period, a semicolon, or a comma and a coordinating conjunction. A colon or dash can introduce an explanation after a complete clause. D + I often needs a comma when D is an introductory dependent clause. Do not choose a separator before knowing which units you are connecting.'],
   ['A transition is not a conjunction','However, therefore, and nevertheless explain the relationship between ideas; they do not join complete clauses the way and or but can. “The sample was small; however, the pattern was consistent” uses a semicolon for the boundary and a comma for the transition. A comma on each side of however leaves a comma splice. Position matters: “The findings were promising. The sample was small, however; a second study was needed” attaches however to the first clause.'],
   ['The SAT shortcut has a limit','If a period and a semicolon appear in otherwise identical choices between the same complete clauses, they often do the same grammatical job. Do not invent a difference in strength. But compare the full choices: capitalization, added words, and the placement of a transition can make apparently similar choices behave differently.']
  ],
  contrast:{wrong:'The map that the team recovered; shows an older coastline.',right:'The map that the team recovered shows an older coastline.',why:'The subject is “The map that the team recovered.” Recovered is inside the relative clause; shows is the main verb. The semicolon would split the subject from its predicate.'},
  checklist:['Locate each main subject and finite verb.','Bracket dependent clauses and modifiers.','Check every word in the answer, not just the punctuation.'],
  check:{stem:'The new catalog, which lists every surviving edition, ____ a gap in the earlier record.',choices:['revealing','; it reveals','reveals',', reveals'],answer:2,why:'“Which lists …” is supplementary. Remove it: “The new catalog reveals a gap.” A finite main verb is needed, with no extra punctuation.'}
 },
 supplements:{
  title:'Know what belongs inside the commas.',subtitle:'Essential information, relative clauses, titles, and appositives.',minutes:10,
  objective:'Decide whether information identifies a noun or interrupts an already complete sentence.',
  sections:[
   ['Meaning determines whether a clause is essential','“The maps that show the river are damaged” selects a subset: only the maps showing the river. The identifying clause stays attached without commas. “These maps, which show the river, are damaged” adds information about maps already identified by these. The supplementary clause is enclosed in commas. Ask which objects the sentence means before deciding where to punctuate.'],
   ['Use the removal test carefully','Removing a supplement should leave both a grammatical sentence and the intended main claim. In “The instrument, a portable spectrometer, arrived yesterday,” removing the middle noun phrase gives “The instrument arrived yesterday.” An appositive can rename a noun without being a complete clause. Semicolons cannot enclose it just because the words inside are long.'],
   ['Match punctuation around a true interruption','A pair of commas or a pair of dashes can enclose a mid-sentence interruption. If a closing dash is already printed, look for the opening dash. Do not mix one comma and one dash as though they were a matched pair. A sentence-final supplement needs only an opening marker because the sentence boundary ends it.'],
   ['Names and titles need context','A role followed by an identifying name often forms one unit: “the chemist Leila Karim.” But “Leila Karim, the project’s lead chemist, …” supplies the name first and then adds a description. Avoid the rule “always put commas around names.” What matters is whether the name identifies the person or supplements an already identified person.']
  ],
  contrast:{wrong:'The archive’s oldest notebook, contains sketches of the harbor.',right:'The archive’s oldest notebook contains sketches of the harbor.',why:'There is no interruption here. The comma merely separates the subject notebook from its verb contains.'},
  checklist:['Identify the noun before the blank.','Ask whether the added words identify a subset or add a description.','Remove a supplement and reconnect the main subject and verb.'],
  check:{stem:'The instrument—a compact sensor designed for underwater use ____ transmitted readings every minute.',choices:[',',';','—',':'],answer:2,why:'The second dash closes the description begun after instrument. The sentence spine is “The instrument transmitted readings.”'}
 },
 colons:{
  title:'Make a colon earn its place.',subtitle:'Explanations, examples, and lists with internal punctuation.',minutes:9,
  objective:'Verify a complete introductory clause and distinguish a list from a new independent clause.',
  sections:[
   ['The clause before a colon must be complete','“The kit contains three tools: a ruler, a compass, and a level” works because the words before the colon form a sentence. “The kit contains: a ruler …” splits the verb from its objects. A list is not enough to justify a colon. Read to the proposed colon, stop, and ask whether the thought is complete.'],
   ['The words after a colon explain what came before','A colon may introduce a noun phrase, a list, or another complete clause. “The result was decisive: every sample showed the same pattern” explains what made the result decisive. This means a colon and a semicolon can sometimes both be grammatical in the same location. A sound question must distinguish the actual options through the full structure and meaning.'],
   ['Avoid punctuation inside tightly connected units','Do not split a subject from its verb, a verb from its object, or a preposition from its object. “The team relied on: three measurements” is wrong for the same underlying reason as “The kit contains: three tools.” The connector on is still waiting for its object.'],
   ['Semicolons also organize complex lists','If each item includes internal commas, a semicolon can separate the larger items: “Mina, a botanist; Theo, an engineer; and Noor, an archivist.” These semicolons are list separators; the items do not each need to be complete clauses. First determine whether you are looking at a list or a boundary between sentences.']
  ],
  contrast:{wrong:'The researchers compared: temperature, pressure, and humidity.',right:'The researchers compared three variables: temperature, pressure, and humidity.',why:'Three variables completes the object of compared. The colon can then introduce the list identifying those variables.'},
  checklist:['Test the entire introduction as a standalone sentence.','Identify what the following explanation or list refers to.','For semicolons, distinguish clauses from complex list items.'],
  check:{stem:'The proposal offered one practical advantage ____ it required no new equipment.',choices:[',',':','; because',', therefore,'],answer:1,why:'The complete clause announces an advantage; the next clause explains it. The comma choices create comma splices, and because makes the clause after a semicolon dependent.'}
 },
 agreement:{
  title:'Find the noun that actually controls the verb.',subtitle:'Hidden subjects, inverted sentences, and number distractors.',minutes:11,
  objective:'Match a finite verb to the head of its subject, regardless of distance or word order.',
  sections:[
   ['The head noun controls agreement','In “The distribution of minerals across the samples varies,” distribution is the head of the subject. Minerals and samples are inside modifying phrases. Cross those phrases out and you get “The distribution varies.” A singular subject often takes a present-tense verb ending in s; a plural subject generally takes the form without it.'],
   ['An embedded clause can be a long distraction','“The extent to which the panels reflect shorter wavelengths remains uncertain” has a subject that includes another subject-verb pair: panels reflect. That pair lives inside the clause modifying extent. The main verb remains still agrees with extent. Do not assume the closest finite verb belongs to the main clause.'],
   ['Reverse an inverted sentence','A sentence can place its location first: “Beyond the ruins lie two workshops.” The subject is two workshops, even though it follows lie. Rewrite it in ordinary order: “Two workshops lie beyond the ruins.” This removes the visual trap created by a nearby singular noun such as settlement or valley.'],
   ['Distinguish and from along with','“The sensor and the camera provide readings” has a compound plural subject. “The sensor, along with two cameras, provides readings” has singular sensor as its subject; the supplementary phrase does not add a second subject. Each and every also require care: “Each of the cameras provides readings.”']
  ],
  contrast:{wrong:'The location of the three sampling stations affect the results.',right:'The location of the three sampling stations affects the results.',why:'One location is the head subject. The plural noun stations sits inside an of-phrase and does not control affects.'},
  checklist:['Find the full subject, then its head noun.','Ignore of, with, and along with phrases.','For inversion, move the noun phrase before the verb.'],
  check:{stem:'Beneath the settlement’s central courtyard ____ the remains of two earlier buildings.',choices:['lies','lie','lying','has lain'],answer:1,why:'Invert it: “The remains lie beneath the courtyard.” The plural subject remains takes lie, despite the nearby singular courtyard.'}
 },
 verbs:{
  title:'Choose a verb by its job, then its time.',subtitle:'Finite verbs, participles, tense, and event order.',minutes:12,
  objective:'Tell whether a blank needs a main verb or a modifier before deciding which tense fits.',
  sections:[
   ['First ask whether the main clause has a verb','A finite verb anchors a clause in tense: reveals, revealed, was revealing. A participle such as revealing can modify a noun, but it cannot by itself finish “The report …”. In “The report, revealing a major inconsistency, prompted a review,” prompted is the main verb and revealing introduces a modifier.'],
   ['Do not count a relative-clause verb twice','In “The letters, which were written during the expedition, reveal the route,” were written belongs to the which-clause. It does not supply the main predicate of The letters. Remove that relative clause and you can see why reveal is still needed. Conversely, if the main verb is already present, a second finite verb without a connector is usually the problem.'],
   ['Build a timeline from evidence','An explicit past date supports past tense when the clause describes an event at that time. An ongoing situation with a present reference point may use present perfect. Past perfect, had plus participle, places one action before another past reference point: “By the time the theater closed, the composer had completed the score.” Do not choose a perfect tense merely because it sounds formal.'],
   ['Check the subject and the full verb phrase','A verb phrase can combine auxiliaries and participles: has been studied is finite because has supplies tense and agreement. Has and have must still agree with the subject. Finally, verify whether the sentence needs active or passive meaning: a researcher analyzes a sample, while a sample is analyzed.']
  ],
  contrast:{wrong:'The model, combining data from three surveys, revealing a consistent trend.',right:'The model, combining data from three surveys, reveals a consistent trend.',why:'Combining is already a modifier. The subject model needs the finite main verb reveals; another participle would leave a fragment.'},
  checklist:['Find the main clause’s finite verb, if one exists.','Label the blank’s job: main verb or modifier.','Use explicit time references and event order, then check agreement.'],
  check:{stem:'The results, which the researchers published last month, ____ an assumption made in the original proposal.',choices:['challenging','to challenge','challenge','having challenged'],answer:2,why:'Published is inside the relative clause. The plural main subject results still needs a finite main verb: challenge.'}
 },
 pronouns:{
  title:'Track the owner. Track the referent.',subtitle:'Possessives, contractions, pronoun case, and clear comparisons.',minutes:10,
  objective:'Choose a form by its grammatical role and its exact referent, rather than by the nearest noun.',
  sections:[
   ['Separate plural from possessive','An s can mark a plural, but apostrophes can mark possession or omitted letters; a plain plural takes no apostrophe. One researcher’s notes belong to one researcher; two researchers’ notes belong to two. Count the owners first. The number of objects owned does not determine the apostrophe: two researchers can share one office and still write “the researchers’ office.”'],
   ['Irregular plurals follow a different ending pattern','Children is already plural and does not end in s, so its possessive is children’s. The same pattern gives women’s and people’s. Do not add another plural s before the apostrophe. Meanwhile, possessive pronouns such as its, theirs, and whose do not take apostrophes. It’s is a contraction of it is or it has.'],
   ['Choose case from the pronoun’s role','Subject forms include they and she; object forms include them and her. In “The captain accompanied them,” the pronoun receives the action and needs object case. A reflexive form such as themselves generally points back to the clause’s subject: “The researchers prepared themselves.” Mentioning the researchers in an earlier sentence does not make every later pronoun reflexive.'],
   ['Compare the same kinds of things','“The telescope’s sensitivity exceeds that of the older instrument” compares sensitivity with sensitivity. That stands for a singular property; those can stand for a plural one. Reject a comparison that sets a property against an object, such as sensitivity against a telescope. Identify the referent of the substitute word explicitly.']
  ],
  contrast:{wrong:'The childrens’ drawings were displayed beside the teachers work.',right:'The children’s drawings were displayed beside the teacher’s work.',why:'Children is an irregular plural, so add apostrophe-s. If one teacher owns the work, teacher also takes apostrophe-s. Context must establish how many owners there are.'},
  checklist:['Name the referent or owner explicitly.','Choose number and grammatical role separately.','Expand contractions and substitute comparison words.'],
  check:{stem:'Two historians shared one office. The ____ office contained a collection of early maps.',choices:['historian’s','historians','historians’','historians’s'],answer:2,why:'There are two owners, so use the regular plural historians plus an apostrophe. One shared office does not make the owners singular.'}
 },
 modifiers:{
  title:'Make the opening description land correctly.',subtitle:'Participial phrases, passive descriptions, and logical subjects.',minutes:8,
  objective:'Connect an introductory modifier to the grammatical subject it actually describes.',
  sections:[
   ['Ask the question implied by the opening phrase','“Examining the samples, …” invites who is examining? “Concerned about erosion, …” invites who is concerned? The grammatical subject immediately after the comma should answer that question. “Examining the samples, the researchers noticed cracks” attaches the modifier to researchers.'],
   ['A later noun cannot rescue the wrong subject','“Examining the samples, cracks were noticed by the researchers” mentions the researchers, but only in a by-phrase. The grammatical subject is cracks. Cracks cannot examine samples. The answer must be checked from the start of the main clause, not by searching for any occurrence of the right person.'],
   ['Passive descriptions attach to things too','“Built in 1890, the bridge …” describes the bridge. The subject need not always be a person. Ask what was built, woven, discovered, or restored. If the next subject is a committee or a lighting system, the sentence may accidentally describe that subject as built in 1890 or woven from fibers.'],
   ['Do not turn a helpful test into an absolute rule','Not every opening phrase behaves identically. Some purpose infinitives can occur with passive clauses, and sentence-level modifiers can comment on a whole statement. For a clean modifier question, focus on the clear action or description presented and the subject logically capable of it. Avoid rejecting a sentence solely because it contains passive voice.']
  ],
  contrast:{wrong:'Hoping to identify the mineral, a microscope was used by the geologist.',right:'Hoping to identify the mineral, the geologist used a microscope.',why:'Hoping describes the geologist. The first sentence makes microscope the grammatical subject, even though the geologist appears later.'},
  checklist:['Ask who acts or what is described.','Identify the main clause’s grammatical subject.','Check that the opening phrase applies to that subject.'],
  check:{stem:'Concerned that the labels would fade, ____',choices:['the display cases were moved by the curator.','new labels replaced the old ones.','the curator photographed every label.','the labels received protective covers.'],answer:2,why:'The curator is capable of concern; cases, labels, and covers are not. The subject must be the curator, not an object followed by a later by-phrase.'}
 },
 parallel:{
  title:'Find the pattern before completing the list.',subtitle:'Series, shared words, correlative pairs, and embedded questions.',minutes:9,
  objective:'Identify the grammatical units governed by a shared word and preserve their structure.',
  sections:[
   ['Read from the shared word','In “The project aims to document the site, to preserve the records, and to train volunteers,” aims governs three infinitive phrases. A long modifier inside the first item does not change that pattern. Find the verb or preposition that introduces the series, then reduce each item to its core form.'],
   ['Mark the boundaries of each unit','The series may contain noun phrases, infinitives, or entire clauses. “The report considers whether the route is safe, whether supplies are available, and whether flooding will delay travel” repeats embedded whether-clauses. An answer that changes the final item into a direct question breaks that structure.'],
   ['Match correlative pairs','In “not only to preserve records but also to make them accessible,” not only and but also introduce matching infinitive phrases. Ignore the length of each phrase. The useful comparison is between the grammatical material immediately after each marker, not between nearby individual words.'],
   ['Preserve embedded-question word order','“The team asked how old the deposits were” embeds a question inside a statement. It uses subject-before-verb order: the deposits were. “How old were the deposits?” is a direct question and reverses that order. A question mark is not needed merely because the statement reports something someone wanted to determine.']
  ],
  contrast:{wrong:'The report asks whether the soil is stable and can the road withstand flooding.',right:'The report asks whether the soil is stable and whether the road can withstand flooding.',why:'Both items are embedded whether-clauses. The second keeps declarative subject-verb order rather than switching into a direct question.'},
  checklist:['Locate the word governing the series.','Bracket complete grammatical units.','Match structures, then check the meaning of the finished sentence.'],
  check:{stem:'The committee asked whether the site was accessible and ____',choices:['were funds available.','whether funds were available.','funds being available.','to make funds available.'],answer:1,why:'The second item repeats the embedded whether-clause pattern and keeps the subject funds before the verb were.'}
 }
};
