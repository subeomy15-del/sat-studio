import { readFile, writeFile } from 'node:fs/promises';
const root=new URL('../data/',import.meta.url);
const lessons=JSON.parse(await readFile(new URL('lessons.json',root),'utf8'));
const additions=[
{id:'rational-expressions',title:'Rational expressions: simplify without losing the domain',category:'Math',description:'Factor first, cancel factors, and preserve restrictions.',minutes:10,tags:['advanced math','rational','polynomials','domain'],content:`## The rule behind cancellation
A fraction is a quotient. You may cancel a common nonzero FACTOR from its numerator and denominator. You cannot cancel a term inside a sum. Every original denominator must stay nonzero, even if simplifying removes that denominator.

## Worked example
Simplify (x² − 9)/(x² − x − 6). Factor the numerator as (x − 3)(x + 3) and the denominator as (x − 3)(x + 2). The expression becomes (x + 3)/(x + 2), but x ≠ 3 and x ≠ −2. At x = 3 the original is undefined; a simplified formula does not restore that input.

## Rational equation
Solve 2/(x − 1) = 3/(x + 2). First exclude x = 1 and x = −2. Multiply both sides by (x − 1)(x + 2): 2(x + 2) = 3(x − 1). Thus 2x + 4 = 3x − 3, giving x = 7. Check: 2/6 = 3/9 = 1/3. The solution is permitted.

## Polynomial reasoning
The remainder when a polynomial P(x) is divided by x − a is P(a). If x − a is a factor, P(a) = 0. For P(x) = x² + kx + 12 to have x − 3 as a factor, 9 + 3k + 12 = 0, so k = −7.

## Trap
(x + 4)/(x + 2) does not simplify to 4/2. The x terms are part of sums, not common factors. Check x = 2: the original is 6/4, not 2.

## Try it without help
Simplify (x² − 16)/(x − 4) and state the excluded input. Then check your result: x + 4, with x ≠ 4.`},
{id:'inequalities-absolute',title:'Inequalities & absolute value: track direction and distance',category:'Math',description:'Keep endpoint rules and sign reversals straight.',minutes:9,tags:['algebra','inequalities','absolute value'],content:`## Inequalities express a range
Solve an inequality like an equation, except multiplying or dividing by a negative number reverses its direction. Adding or subtracting a negative number does NOT reverse it.

## Worked example
−3x + 8 ≥ 20 gives −3x ≥ 12, then x ≤ −4. Dividing by −3 reverses ≥ to ≤. Verify the endpoint: x = −4 gives 20, which is allowed. Test x = −5: the expression is 23, also allowed. A plausible wrong answer, x ≥ −4, would include x = 0, but 8 is not at least 20.

## Absolute value is distance
|x − a| is the distance between x and a. |x − 3| = 5 gives x = 8 or x = −2. |x − 3| < 5 means −5 < x − 3 < 5, so −2 < x < 8. |x − 3| > 5 gives x < −2 OR x > 8.

## Translating constraints
A club can spend at most $80 on a $20 delivery charge and $6 notebooks. Write 20 + 6n ≤ 80, giving n ≤ 10. Because n is a count, permitted values are nonnegative integers. The maximum is 10 notebooks.

## Graphs and endpoints
≤ and ≥ include their boundary; < and > do not. For two simultaneous constraints, use the overlap, not their union. Test a convenient point in a proposed solution region.

## Check yourself
Solve 5 − 2x < 11. Subtract 5, divide by −2, reverse the sign: x > −3. Equality is excluded because the original sign is strict.`},
{id:'function-transformations',title:'Functions: transform graphs and read parameters',category:'Math',description:'Separate input changes, output changes, roots, and intersections.',minutes:10,tags:['advanced math','function','transformation','vertex','parameters'],content:`## A function is an input-output rule
f(4) asks for the output when the input is 4. Solving f(x) = 4 asks which inputs produce 4. These are different tasks.

## Transformations
f(x) + k shifts outputs up by k. f(x − h) shifts the graph right by h, because the old input is reached when the new x is h larger. af(x) scales the outputs; a negative a also reflects across the x-axis.

## Worked example
g(x) = −2(x − 3)² + 7 has vertex (3, 7), opens downward, and has maximum output 7. Its y-intercept is g(0) = −18 + 7 = −11. Its maximum is not its y-intercept.

## A parameter question
If f(x) = ax² + bx + c and f(0) = 5, then c = 5. If its roots are 2 and 6, write f(x) = a(x − 2)(x − 6). Then f(0) = 12a = 5, so a = 5/12. Choose the form that makes the given information visible.

## Calculator shortcut
To solve f(x) = g(x), graph y = f(x) and y = g(x), then inspect intersection x-coordinates. Zoom to see all relevant intersections and check domain restrictions. An intersection's y-coordinate is not the requested x.

## Transfer
For h(x) = (x + 4)² − 9, the vertex is (−4, −9), the minimum is −9, and h(0) = 7. Practice distinguishing all three.`},
{id:'data-inference',title:'Data claims: correlation, sampling & uncertainty',category:'Math',description:'Decide which conclusions an experiment or sample actually supports.',minutes:10,tags:['data','statistics','sampling','margin','scatterplot','regression'],content:`## Ask how the data were collected
Random sampling helps a sample represent its population. Random assignment helps isolate the effect of a treatment. These serve different purposes. An observational association alone does not establish causation.

## Worked example
A school randomly selects 200 students and asks about sleep and test scores. The sample can inform conclusions about that school's students, subject to uncertainty. A relationship between sleep and scores does not prove sleep caused the score difference: workload, health, or other factors may influence both. This sample does not automatically represent students nationwide.

## Treatment study
Volunteers are randomly assigned to use a new study method or their usual method. A well-conducted experiment can support a causal conclusion for the participants. Because participants were volunteers rather than a representative random sample, generalization to all students needs care.

## Margin of error
An estimate of 60% with a margin of error of 4 percentage points describes a range from 56% to 64% in the stated inferential setting. It does not mean 4% of 60%. Larger random samples generally reduce uncertainty when other conditions are comparable. Margin of error does not repair a biased sampling method.

## Regression
A line y = 3.2x + 15 predicts an increase of 3.2 y-units for each additional x-unit. The intercept predicts y = 15 at x = 0; that prediction may lack practical meaning if 0 is outside the observed range. Avoid treating extrapolation far beyond the data as certain.

## Trap checklist
Which population? Random sample or assignment? Correlation or causation? Percentage points or percent change? Prediction or observed value?`},
{id:'reading-logic',title:'Reading logic: complete, strengthen, or weaken a claim',category:'Reading',description:'Match the evidence to the precise conclusion instead of a related topic.',minutes:11,tags:['inference','evidence','strengthen','weaken','logical','completion'],content:`## Identify the job before choosing an answer
A logical-completion question asks what the passage supports. A strengthen or weaken question asks how an additional finding affects a particular claim. A sentence about the same topic is not enough: it must change the support for that claim.

## Worked original example
Researchers found that plants near a road grew more slowly than plants farther away. They proposed that road dust caused the difference. A finding that roadside plants received much less water weakens this causal explanation by providing an alternative cause. A finding that plants exposed to road dust grew slowly under otherwise identical laboratory conditions strengthens it.

## Your four-step method
1. Name the claim in plain language: “Dust causes slower growth.”
2. Name the evidence: “Plants near the road grew more slowly.”
3. Identify the missing connection: “Were other conditions comparable?”
4. Test whether each choice strengthens, weakens, or leaves that connection unchanged.

## Inferences need restraint
“Some species survived” does not support “all species survived.” “May increase” does not support “always increases.” Eliminate answers that shift population, time period, cause, or degree beyond what is stated.

## Why wrong answers tempt you
They repeat a passage word but support a different claim; reverse cause and effect; add an outside fact; or turn a cautious finding into a certainty. Name the exact mismatch rather than calling an answer “irrelevant” without explanation.

## Try it
A town's library attendance rose after it extended evening hours. What additional observation would weaken the claim that the longer hours caused the rise? One possible answer is a simultaneous closure of the town's other library, which supplies an alternative explanation.`},
{id:'graphs-reading',title:'Reading graphs: compare the right values',category:'Reading',description:'Connect a chart to a claim without confusing units, trends, or categories.',minutes:9,tags:['reading','graphs','tables','quantitative evidence'],content:`## Read the labels first
Before comparing bars or points, identify the x-axis, y-axis, units, legend, and time period. Then paraphrase the precise claim the question asks you to support.

## Worked original example
A table lists survival after a drought: Species A, shaded plots 80%, exposed plots 45%; Species B, shaded plots 60%, exposed plots 55%. The claim is that shade had a larger association with survival for Species A than for Species B. Compare differences within each species: 80 − 45 = 35 percentage points for A and 60 − 55 = 5 for B. The relevant evidence is 35 versus 5, not simply 80 versus 60.

## Choose evidence that answers the claim
If the claim compares CHANGE, compare differences or rates of change. If it compares LEVELS at a time, compare values at that time. If it concerns an exception, identify the value that violates the general pattern.

## Common traps
A category can have the highest final value without the largest increase. An increase from 10 to 20 is 10 units and 100%, which are different measures. A graph association does not by itself prove causation. A truncated axis can exaggerate visual differences; read the actual numbers.

## A repeatable annotation
Write “compare ___ with ___ at ___, in ___ units” before scanning answers. Require every part of the chosen statement to match the figure. If an option contains two claims joined by “and,” both must be supported.`},
];
for(const lesson of additions){const i=lessons.findIndex(l=>l.id===lesson.id);if(i<0)lessons.push(lesson);else lessons[i]=lesson;}
await writeFile(new URL('lessons.json',root),JSON.stringify(lessons,null,2)+'\n');
const bank=JSON.parse(await readFile(new URL('practice.json',root),'utf8'));
function add(id,topic,category,difficulty,question,choices,answerIndex,explanation,hint,tags=[]){const q={id,topic,category,difficulty,question,choices,answerIndex,explanation,hint,tags};const i=bank.findIndex(q=>q.id===id);if(i<0)bank.push(q);else bank[i]=q;}
// Independently derived original SAT-style exercises; explanations verify targets.
add('ext01','Rational expressions','Math','Medium','For x ≠ 4, which expression equals (x² − 16)/(x − 4)?',['x − 4','x + 4','x² + 4','1'],1,'Factor x² − 16 = (x − 4)(x + 4). Cancel the nonzero factor x − 4 to obtain x + 4. The original restriction x ≠ 4 still applies.','Factor the difference of two squares.',['advanced math','rational']);
add('ext02','Rational equations','Math','Medium','What is the solution to 2/(x − 1) = 3/(x + 2)?',['−7','1','7','−2'],2,'Exclude x = 1 and −2. Cross-multiply: 2x + 4 = 3x − 3, so x = 7. Check: 2/6 and 3/9 both equal 1/3. The excluded values cannot be solutions.','Multiply by both denominators, then check the excluded inputs.',['advanced math']);
add('ext03','Polynomial factors','Math','Hard','If x − 3 is a factor of x² + kx + 12, what is k?',['−7','−3','3','7'],0,'A factor x − 3 means the polynomial equals zero at x = 3. Substitute: 9 + 3k + 12 = 0, so k = −7. Check: x² − 7x + 12 = (x − 3)(x − 4).','A root makes the polynomial equal zero.',['advanced math']);
add('ext04','Inequalities','Math','Medium','Which inequality is equivalent to −3x + 8 ≥ 20?',['x ≥ −4','x ≤ −4','x ≤ 4','x ≥ 4'],1,'Subtract 8 to get −3x ≥ 12. Divide by −3 and reverse the sign: x ≤ −4. At x = −4, the original expression equals 20; at x = −5 it equals 23.','Dividing by a negative reverses the inequality.',['algebra']);
add('ext05','Absolute value','Math','Medium','What is the sum of the two solutions to |x − 3| = 5?',['−2','3','6','8'],2,'x − 3 can equal 5 or −5, giving x = 8 or −2. Their sum is 6. The question asks for the sum, not either individual solution.','Distance 5 from 3 gives one value on each side.',['algebra']);
add('ext06','Function transformations','Math','Medium','The function g is defined by g(x) = −2(x − 3)² + 7. What is its maximum value?',['−11','−2','3','7'],3,'Because (x − 3)² ≥ 0, −2(x − 3)² ≤ 0. Thus g(x) ≤ 7, with equality at x = 3. The maximum output is 7; 3 is the input where it occurs and −11 is the y-intercept.','Use vertex form and the sign of the leading coefficient.',['advanced math']);
add('ext07','Function evaluation','Math','Easy','If f(x) = 2x² − 3, what is f(−2)?',['−11','−7','5','13'],2,'f(−2) = 2(−2)² − 3 = 2·4 − 3 = 5. Square the entire negative input: (−2)² = 4.','Substitute the input using parentheses.',['advanced math']);
add('ext08','Percent change','Math','Hard','An item’s price rises by 20% and then falls by 20%. The final price is $96. What was its original price?',['$92.16','$96','$100','$104'],2,'The combined multiplier is 1.20 × 0.80 = 0.96. If the original price is p, 0.96p = 96, so p = 100. Check: 100 → 120 → 96. Equal percentage changes do not cancel because their bases differ.','Write a multiplier for each change.',['data','percent']);
add('ext09','Unit conversion','Math','Medium','A cyclist travels at 18 kilometers per hour. What is this speed in meters per second?',['3','5','18','30'],1,'18 km/h × 1000 m/km ÷ 3600 s/h = 5 m/s. Both kilometer and hour units cancel. Multiplying only by 1000 ignores the time conversion.','Convert distance and time, not just distance.',['data','units']);
add('ext10','Weighted mean','Math','Medium','A group of 12 students has a mean score of 80. Another group of 8 has a mean score of 90. What is the combined mean?',['82','84','85','86'],1,'The total is 12·80 + 8·90 = 960 + 720 = 1680. Divide by all 20 students: 1680/20 = 84. The unweighted mean 85 would be valid only for equal group sizes.','Recover each group’s total before averaging.',['data','statistics']);
add('ext11','Margin of error','Math','Easy','A poll estimates that 62% of a population supports a proposal, with a margin of error of 3 percentage points. What range does this report describe?',['59% to 65%','60.14% to 63.86%','3% to 62%','62% to 65%'],0,'Add and subtract 3 percentage points: 62 − 3 = 59 and 62 + 3 = 65. The margin is not 3% of 62.','Percentage points are added to and subtracted from the reported percentage.',['data','sampling']);
add('ext12','Study design','Math','Hard','Researchers randomly assign 100 volunteers to either a new tutoring program or the usual program. The new-program group improves more. Which conclusion is best supported by this design, assuming the experiment was well conducted?',['The program is effective for every high-school student.','The program caused greater improvement among the participants.','Random assignment makes the volunteers a representative national sample.','Improvement cannot have any causal explanation.'],1,'Random assignment supports a causal comparison between treatments for the participants. Volunteer recruitment limits generalization to a broader population. Random assignment and random sampling serve different purposes.','Separate a causal claim from a claim about the population.',['data','experiments']);
add('ext13','Circle equations','Math','Medium','A circle has equation (x − 2)² + (y + 3)² = 25. What is its center?',['(2, −3)','(−2, 3)','(2, 3)','(−2, −3)'],0,'The center-radius form is (x − h)² + (y − k)² = r². Thus h = 2, k = −3, and r = 5. The sign inside each parenthesis is opposite the coordinate.','Compare with (x − h)² + (y − k)² = r².',['geometry']);
add('ext14','Similar triangles','Math','Medium','Two similar triangles have corresponding side lengths 3 and 9. If the smaller triangle’s area is 10, what is the larger triangle’s area?',['30','60','90','270'],2,'The length scale factor is 9/3 = 3. Areas scale by 3² = 9, so the larger area is 10·9 = 90. Multiplying area by only 3 confuses lengths and areas.','Area changes by the square of the length scale factor.',['geometry']);
add('ext15','Trigonometry','Math','Medium','In a right triangle, an acute angle θ has opposite side length 5 and hypotenuse length 13. What is cos θ?',['5/13','5/12','12/13','13/12'],2,'The adjacent side is √(13² − 5²) = √144 = 12. Cosine is adjacent/hypotenuse, so cos θ = 12/13. The fraction 5/13 is sine.','Find the third side, then use adjacent divided by hypotenuse.',['geometry','trigonometry']);
add('ext16','Circle arcs','Math','Hard','An arc has length 3π in a circle with radius 6. What is the arc’s central angle in radians?',['π/2','π','2π','18π'],0,'Arc length s = rθ when θ is in radians. Thus θ = 3π/6 = π/2. Check: this is one quarter of a full circle, whose circumference is 12π.','Use s = rθ with radians.',['geometry']);
add('ext17','Sentence boundaries','Reading & Writing','Medium','Which choice correctly completes the sentence? “The experiment was repeated three times _______ the results remained consistent.”',[',',';','no punctuation',': and'],1,'Each side is an independent clause: “The experiment was repeated three times” and “the results remained consistent.” A semicolon joins them. A comma alone creates a comma splice. A colon followed by “and” does not form the intended boundary.','Test whether both sides could stand alone.',['grammar','punctuation']);
add('ext18','Transitions','Reading & Writing','Medium','“The telescope’s mirror is larger than its predecessor’s. _______ it can collect more light.” Which transition best connects the sentences?',['Nevertheless,','For example,','Consequently,','Similarly,'],2,'The second sentence gives a consequence of the first: a larger mirror collects more light. Consequently marks that cause-and-effect relationship. Nevertheless signals contrast; for example introduces an instance; similarly compares parallel cases.','Name the relationship before reading the transitions.',['expression','writing']);
add('ext19','Subject-verb agreement','Reading & Writing','Medium','Which choice completes the sentence in Standard English? “The collection of photographs from the expeditions _______ in the museum.”',['are displayed','were displayed','have been displayed','is displayed'],3,'The subject is “collection,” singular. “Of photographs from the expeditions” modifies the collection and does not control the verb. “Is displayed” agrees with the subject.','Find the head noun, not the nearest plural noun.',['grammar']);
add('ext20','Modifiers','Reading & Writing','Medium','Which revision avoids a dangling modifier?',['After analyzing the data, the conclusion was unexpected.','After analyzing the data, an unexpected conclusion appeared.','After analyzing the data, the researchers reached an unexpected conclusion.','After analyzing the data, the unexpected result was a surprise.'],2,'The opening phrase describes whoever analyzed the data. Only “the researchers” can logically perform that action. The other subjects—conclusion, result—cannot analyze data.','Ask who performs the action in the opening phrase.',['grammar']);
add('ext21','Inference','Reading & Writing','Hard','“Seeds recovered from the oldest layer of the site were wild varieties. Domesticated varieties appeared only in more recent layers.” Which inference is best supported?',['The site’s earliest occupants never ate plants.','Cultivation of domesticated varieties began after the oldest layer formed.','Every seed in the region eventually became domesticated.','The oldest layer formed more recently than all other layers.'],1,'The layers show wild varieties first and domesticated varieties later. This supports a later beginning of cultivation of domesticated varieties at the site. It does not establish what all occupants ate or what happened to every seed in the region.','Preserve the scope and time sequence of the evidence.',['reading','information']);
add('ext22','Main idea','Reading & Writing','Medium','“Some city planners once treated small parks as decorative extras. Recent studies, however, suggest that these parks can lower nearby temperatures and provide residents with accessible outdoor space.” What is the main idea?',['Small parks have practical benefits that exceed their decorative role.','All cities have replaced large parks with small ones.','Decorative parks always increase temperatures.','Outdoor space matters only to city planners.'],0,'The passage contrasts an earlier view with evidence of practical benefits. The correct choice captures that contrast without adding an unsupported claim about all cities, higher temperatures, or planners alone.','Summarize both the earlier view and the newer evidence.',['reading','information']);
add('ext23','Vocabulary in context','Reading & Writing','Medium','“The team’s initial finding was tentative; further experiments were needed before the researchers could draw a firm conclusion.” As used here, “tentative” most nearly means:',['provisional','careless','definitive','unrelated'],0,'The contrast with “a firm conclusion” and the need for further experiments show that the initial finding was provisional, meaning subject to confirmation. Tentative does not necessarily imply carelessness.','Predict the meaning from the contrast before checking choices.',['reading','craft']);
add('ext24','Paired texts','Reading & Writing','Hard','Text 1: “Introducing trees to an urban block should lower summer temperatures because foliage supplies shade.” Text 2: “Trees can provide cooling, but the effect varies with species, water availability, and street design.” How would the author of Text 2 most likely respond to Text 1?',['Reject the possibility that trees provide shade.','Agree with the general idea but emphasize conditions affecting the outcome.','Claim that street design has no effect on cooling.','Assert that all tree species cool blocks equally.'],1,'Text 2 accepts possible cooling but qualifies the claim with several conditions. The response is qualified agreement, not outright rejection. Choices claiming no design effect or equal performance contradict Text 2.','Find both the agreement and the qualification.',['reading','craft']);
await writeFile(new URL('practice.json',root),JSON.stringify(bank,null,2)+'\n');
console.log(`${lessons.length} lessons; ${bank.length} original practice questions.`);
