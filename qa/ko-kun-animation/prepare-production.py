"""Define the complete asset-only production and reusable clip relationships."""
import json
from pathlib import Path

base=Path(__file__).resolve().parent
catalogue=json.loads((base/'catalogue.json').read_text())
pilot=json.loads((base/'pilot/manifest.json').read_text())
reuse={'attentive-idle-loop','walk-start','walk-loop','walk-stop','read-loop','sit-down','stand-up'}
actions={
'trot-loop':'A complete in-place quick quadrupedal trot cycle. Alternate the two diagonal leg pairs over twelve frames; all FOUR actual legs move, two forelegs and two hindlegs. Planted paws stay on the baseline, knees bend and paws lift visibly. No arms or props. Three tails counter-swing. Return to first contact pose.',
'hover-idle-loop':'Float calmly in place, body bobbing slowly up then down over twelve frames. All FOUR actual fox legs are tucked or dangling, never extra arms. Feet remain above the invisible baseline. Three tails gently undulate; blink at midpoint. Return to initial hovering pose.',
'floating-travel-loop':'In-place rightward floating travel cycle. Lean gently right, four actual fox legs tucked, three tails stream LEFT and softly wave. No running legs and no added arms. Small bob through twelve poses; return to first traveling hover pose.',
'seated-watch-loop':'Seated neutral fox with TWO forelegs ending at two front paws, and TWO hindlegs with their rear paws beside the rump. Four limbs total. Calm breathing, small ear turn, a blink, tails swaying slightly; return to first seated neutral pose.',
'think-action':'Seated neutral -> thoughtful head tilt and one of his THREE tails curls toward cheek -> return seated neutral. Keep the FOUR actual limbs resting naturally; the curling tail has a vermilion fur tip and is not a hand. No new arms.',
'insight-action':'Seated neutral -> ears perk and eyes brighten, one tiny vermilion ink-like spark appears above a paw -> spark dissolves and fox returns neutral. Do not add an arm to hold the spark. Four actual limbs only, three tails throughout.',
'groom-action':'Seated fox lifts ONE of his existing forelegs to lick its paw, uses that same forepaw to smooth one ear, then returns it to its original resting location. The lifted front paw is NOT also drawn on the ground. Other forepaw and two hind paws remain; total four limbs. Three tails.',
'stretch-action':'Standing four-pawed fox -> extend the SAME two forelegs forward, lower chest, arch back with the same two hindlegs supporting rump -> return standing neutral. Four legs total, three tails unfurl and settle. No other limbs.',
'tail-play-action':'Four-pawed standing fox looks back at one of his three tails, lifts ONE existing foreleg to gently bat its vermilion tip, and puts that SAME paw back down. Only THREE paws remain grounded while the fourth is raised. No additional arm. Return standing neutral.',
'greeting-action':'Four-pawed standing neutral -> small head bow -> lift ONE actual foreleg and wave its paw -> lower that SAME paw into its original position. During wave only THREE other paws stay on the ground. Exactly four limbs, three tails, no props.',
'sleep-loop':'Curled sleeping fox, muzzle resting on ONE actual forepaw, other forepaw tucked beneath chest, two hindlegs tucked into body. Four limbs total, not all need be visible. Exactly THREE tails curl around the body with three separate vermilion tips visible. Subtle breathing and tiny ear twitch. Return to starting curled pose.',
'meditate-loop':'Seated upright on rump with TWO hind paws on the ground; TWO forepaws rest lightly on thighs, attached to the only two forearms. NO additional straight forelegs below these arms. Close eyes, breathe slowly, three tails sway in a calm coordinated fan. Return to initial meditation pose.',
'write-loop':'Seated, only TWO hind feet on the ground and TWO forearms working. Near forepaw holds a small brush, far forepaw steadies open ivory scroll with indigo rollers. Twelve poses: make two slow abstract ink strokes, lift brush, think, return to first ready-to-write pose. No extra front paws on ground. No readable letters. Same scroll and brush throughout.',
'samurai-loop':'Upright bipedal fox with ONLY TWO hind feet grounded and EXACTLY TWO forearms. Both actual forepaws hold ONE real steel katana with dark wrapped grip and a small guard. Simple vermilion headband and scabbard at hip. Ready guard -> raise blade -> one controlled practice cut to right -> recover and small respectful nod -> return ready guard. Metal blade has restrained highlight, fixed length. No targets or scenery. No grounded front legs beneath the sword arms. Exactly four limbs and three tails.',
'ninja-loop':'Wearing a simple indigo headband, creep in place to the RIGHT on the SAME FOUR quadrupedal legs. Lower body, tiptoe cautiously, glance around, pause, return to first crouched ready pose. No arm gestures, no weapons, no duplicated legs. Three tails stay low but distinct.',
'spirit-magic-loop':'Seated with TWO hind feet grounded and TWO forearms lifted in front of chest, no straight front legs on floor. Only those TWO forepaws guide a tiny vermilion-and-indigo wisp: round wisp -> little fox-shaped spirit -> round wisp again, all between paws and within cell. Four limbs total, three tails. No halo, smoke background, magic circle or additional body parts.',
'straw-hat-adventurer-loop':'UPRIGHT ON TWO HIND FEET ONLY. Exactly TWO forearms and TWO hindlegs in the WHOLE body. No quadrupedal forelegs touching ground. Wear straw hat with red band and an open red vest. Frames 1-3 use one actual forepaw to tip hat while the other forepaw rests at chest; 4-5 lower that same paw and draw back; 6-8 extend that ONE forearm in a playful rubbery punch to right (Luffy reference), other forearm remains at chest; 9-12 retract and return ready pose. Two feet plus two hand-paws at every point, never five or six limbs. Exactly three tails. Punch stays inside cell.',
'fishing-loop':'Seated with TWO hind feet and TWO working forearms only. Hold tiny fishing rod in one forepaw, other forepaw manages line. Cast a short line within cell, wait, lift a single autumn leaf on hook, inspect with mild surprise, detach and tuck leaf behind hip, return rod to first ready position. No pond, floor or scenery. Never draw extra grounded front legs beneath working arms. Same rod throughout.',
'bamboo-flute-loop':'Seated, TWO hind feet grounded, TWO actual forearms holding ONE short bamboo flute near muzzle. No extra front legs on floor. Play a gentle phrase, sway ears and three tails, blink, return first playing pose. Four limbs total, no musical text or background.',
'tea-break-loop':'Seated with TWO hind paws grounded and TWO working forepaws only. Tiny cup, flask and folded cloth near body. Use one forepaw to hold cup and the other to pour from flask; SET flask down before bringing cup to mouth; sip with same two forepaws, lower cup, pick flask up again into ready-to-pour starting pose. Never create a third hand or extra front legs. No steam background, no tabletop or floor.',
'fan-dance-loop':'UPRIGHT on TWO hind feet with TWO forearms only. One forepaw holds open muted vermilion folding fan; other forepaw rests near chest. Small two-step flourish on those same two hind feet, fan arcs gracefully, small bow, return initial fan-ready stance. No extra grounded front legs or spare hand. Exactly three tails.',
'curl-up-action':'Seated neutral four-limbed fox progressively folds the SAME two forelegs and two hindlegs beneath body, curls muzzle onto one forepaw, wraps exactly THREE tails around body, ending in curled sleeping ready pose with three vermilion tail tips visible. No duplicated paws or extra tails.',
'take-off-action':'Standing on the SAME FOUR fox paws -> bend legs slightly -> lift body gently above invisible baseline -> tuck those SAME four legs into a calm hover. Exactly three tails spread and float. No extra arms, floor, takeoff cloud, dust or shadow. End in neutral hover pose.'
}
props_actions={
'read':'Retrieve a small rolled ivory scroll with indigo rollers from behind hip using ONE actual foreleg, then use the TWO actual forepaws to unroll it before the body. Lifted front paws must disappear from their former grounded positions. End in the supplied open-scroll reading pose. Two forelimbs plus two hindlimbs only.',
'write':'Retrieve and unroll ivory scroll, then bring out brush; use the same TWO forepaws, not added arms. End in seated ready-to-write pose, one paw holding brush and the other steadying scroll.',
'samurai':'Rear onto ONLY the two hind feet; use the TWO forepaws to retrieve and tie vermilion headband, attach scabbard and draw the real steel katana. End in the supplied upright guard pose. No front feet remain on ground once forearms lift.',
'ninja':'Use the SAME actual forepaws to retrieve and tie indigo headband while briefly balancing on hind feet, then lower these forepaws back to ground and crouch into the ninja ready pose. Never add arms to four grounded legs.',
'spirit-magic':'Raise the TWO existing forelegs from their resting positions, two hind paws remain grounded; slowly gather a tiny colored wisp between the forepaws into the supplied ready spell pose. No extra front feet remain beneath raised forearms.',
'straw-hat-adventurer':'From four-pawed neutral rear onto ONLY TWO hind feet, lifting BOTH forelegs off the ground. Those SAME TWO forepaws retrieve and slip into open red vest, retrieve red-banded straw hat and put it between ears. End upright in supplied adventurer ready pose, with TWO feet on ground and TWO forepaws at chest. No grounded front legs, no added arms.',
'fishing':'Lift the TWO actual forelegs off ground while seated on rump and two hind feet; retrieve a tiny rod, unfold it and arrange line into ready-to-cast pose. Four limbs total; no grounded front legs under the working forearms.',
'bamboo-flute':'While seated, lift the TWO actual forelegs away from ground, retrieve ONE small bamboo flute and raise to muzzle into supplied ready-to-play pose. Two hind feet plus two forepaws only.',
'tea-break':'While seated, use the TWO actual forepaws to unwrap a little cloth with cup and flask. Set cloth near body, pick up cup and flask into ready-to-pour pose. Two forearms plus two hindlegs only; no grounded forelegs under arms.',
'fan-dance':'Rear onto ONLY TWO hind feet; the TWO actual forepaws retrieve one small folded vermilion fan and open it into ready-to-dance pose. Forepaws are lifted front legs, not added arms. Four limbs total.'
}

clips=[]
for routine in catalogue['routines']:
    kind=routine['kind'];rid=routine['id'];pose=routine['pose']
    for phase in catalogue['clipExpansion'][kind]:
        key=f'{rid}-{phase}'
        item={'id':key,'routine':rid,'name':routine['name'],'kind':kind,'phase':phase,'from':pose,'to':pose,'loop':phase=='loop','frameDurationMs':200 if rid in ['attentive-idle','hover-idle','seated-watch','sleep','meditate','read','write','bamboo-flute','tea-break'] else 100,'props':routine.get('props',[])}
        if kind=='travel':
            active=rid+'-travel';item['from']=active if phase in ['loop','stop'] else pose;item['to']=active if phase in ['loop','start'] else pose
        if kind=='activity':
            active=rid+'-active';item['from']=active if phase in ['loop','exit'] else pose;item['to']=active if phase in ['loop','entry'] else pose
        if key in reuse:
            item.update({'mode':'reuse','frames':f'pilot/frames/{key}','sourceReview':'requires-anatomy-audit'})
        elif phase in ['exit','stop']:
            item.update({'mode':'reverse','deriveFrom':f'{rid}-'+('entry' if phase=='exit' else 'start'),'sourceReview':'inherits-reviewed-source-poses'})
        else:
            pose_ref='references/seated-four-limbs.png' if pose in ['seated','curled'] else 'pilot/frames/attentive-idle-loop/00.png'
            if rid in ['samurai','straw-hat-adventurer','fan-dance']:pose_ref='references/upright-four-limbs.png'
            if rid=='ninja':pose_ref='pilot/frames/attentive-idle-loop/00.png'
            action=actions.get(key)
            if phase=='entry':action=props_actions[rid]+' First frame neutral, last frame matches the supplied active endpoint; move only the actual four limbs. Props enter visibly. The exit will reverse these same poses, so keep unpacking physically reversible.'
            if phase=='start':action='Begin neutral '+pose+' pose. Shift into '+rid+' travel gradually, using only the SAME FOUR actual legs. No props or new arms. End in the supplied travel loop first contact/ready pose. Body stays in place; exit will reverse this transition.'
            assert action,key
            item.update({'mode':'generate','action':action,'reference':pose_ref,'generationStage':2 if phase in ['entry','start'] else 1,'sourceReview':'pending-generation'})
        clips.append(item)
for transition in catalogue['transitions']:
    key=transition['id'];item={'id':key,'routine':'transition','name':key.replace('-',' ').title(),'kind':'transition','phase':'action','from':transition['from'],'to':transition['to'],'loop':False,'frameDurationMs':100,'props':[]}
    if key in reuse:item.update({'mode':'reuse','frames':f'pilot/frames/{key}','sourceReview':'requires-anatomy-audit'})
    elif key in ['wake-and-sit','land']:item.update({'mode':'reverse','deriveFrom':'curl-up' if key=='wake-and-sit' else 'take-off','sourceReview':'inherits-reviewed-source-poses'})
    else:item.update({'mode':'generate','action':actions[key+'-action'],'reference':'pilot/frames/attentive-idle-loop/00.png' if key=='take-off' else 'references/seated-four-limbs.png','generationStage':1,'sourceReview':'pending-generation'})
    clips.append(item)
assert len(clips)==56 and len({c['id'] for c in clips})==56
assert sum(c['mode']=='generate' for c in clips)==35
directory=base/'production';directory.mkdir(exist_ok=True)
(directory/'spec.json').write_text(json.dumps({'character':'A, no collar','fullProductionAuthorized':True,'authorization':'Fix and implement all the animation','featureCodeInScope':False,'browserAudit':'blocked: browser tool rejects file protocol; inspect exported source poses directly','limbLimit':4,'tailCount':3,'clips':clips},indent=2)+'\n')
print('Defined 56 clips: 35 new source sheets, 7 reused clips, 14 reversed clips.')
