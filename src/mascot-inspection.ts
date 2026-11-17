/** Phases driven by the tab photo selector. A missing phase closes inspection. */
export type ImageInspectionPhase='aim'|'scan'|'reveal'|'focus';
export type MascotInspectionPose=ImageInspectionPhase|'ready'|'put-away';

export const mascotInspectionMarkup=`
<span class="inspect-cue" aria-hidden="true">
  <span class="inspect-photo"><i class="inspect-picture"></i><i class="inspect-reticle"></i><i class="inspect-scanline"></i></span>
  <span class="inspect-loupe"><i></i></span>
  <span class="inspect-sparks"><i></i><i></i><i></i></span>
</span>`;

export const mascotInspectionStyles=`
.inspect-cue{display:none;position:absolute;left:62%;top:54%;width:35%;height:28%;pointer-events:none;--inspect-dir:1}
.sprite.face-left .inspect-cue{left:3%;--inspect-dir:-1}
.sprite[data-inspection] .inspect-cue{display:block}
.inspect-photo{position:absolute;inset:8% 10% 16% 1%;overflow:hidden;border:2px solid #30283a;background:#fff1c8;box-shadow:2px 2px #30283a80;transform:rotate(calc(-8deg * var(--inspect-dir)));transform-origin:bottom center}
.inspect-picture{position:absolute;inset:13% 9% 20%;background:linear-gradient(145deg,#7691ab,#c6c3ad 78%);overflow:hidden}
.inspect-picture::before,.inspect-picture::after{content:'';position:absolute}
.inspect-picture::before{left:10%;top:10%;width:19%;height:26%;background:#f5c47e}
.inspect-picture::after{inset:7% 0 0;background:linear-gradient(130deg,#ede7ce 34%,#76887f 36%,#35516a 75%);clip-path:polygon(0 100%,0 80%,26% 49%,34% 57%,57% 4%,82% 76%,91% 59%,100% 87%,100% 100%)}
.inspect-reticle{position:absolute;inset:18% 16% 25%;border:1px solid #fff4c4;box-shadow:0 0 1px #352633;opacity:0}
.inspect-reticle::after{content:'';position:absolute;left:44%;top:39%;width:14%;height:18%;background:#fff4c4}
.inspect-scanline{position:absolute;top:14%;left:9%;right:9%;height:2px;background:#f0bf70;box-shadow:0 1px 3px #ffdda0;opacity:0}
.inspect-loupe{position:absolute;left:48%;top:-8%;width:52%;aspect-ratio:1;border:3px solid #30283a;border-radius:50%;background:#ddeecc50;box-shadow:1px 1px #fae5ac;transform-origin:75% 85%}
.inspect-loupe::after{content:'';position:absolute;left:72%;top:87%;width:68%;height:30%;background:linear-gradient(#583843 42%,#30283a 42%);transform:rotate(48deg);transform-origin:left}
.inspect-loupe i{position:absolute;top:14%;left:14%;width:35%;height:28%;border-block-start:2px solid #fff8dc;border-radius:50%;transform:rotate(-27deg)}
.sprite.face-left .inspect-loupe{left:6%}.sprite.face-left .inspect-loupe::after{left:auto;right:72%;transform:rotate(-48deg);transform-origin:right}
.inspect-sparks{position:absolute;inset:-13% -6% 32%;visibility:hidden}
.inspect-sparks i{position:absolute;width:8%;aspect-ratio:1;background:#fae5ac;box-shadow:1px 1px #76523d;transform:rotate(45deg)}
.inspect-sparks i:nth-child(1){left:24%;top:18%}.inspect-sparks i:nth-child(2){left:58%;top:0}.inspect-sparks i:nth-child(3){left:79%;top:31%}
.sprite[data-inspection] canvas{--inspect-dir:1;transform-origin:62.5% 85%}
.sprite.face-left[data-inspection] canvas{--inspect-dir:-1;transform-origin:37.5% 85%}
.sprite[data-inspection=aim] canvas{animation:ko-mascot-inspect-lean 440ms both}
.sprite[data-inspection=aim] .inspect-cue{animation:ko-mascot-inspect-photo 390ms cubic-bezier(.2,.72,.29,1) both}
.sprite[data-inspection=aim] .inspect-loupe{animation:ko-mascot-inspect-loupe 530ms cubic-bezier(.18,.68,.26,1) both}
.sprite[data-inspection=scan] canvas{animation:ko-mascot-inspect-track 1280ms ease-in-out 2 both}
.sprite[data-inspection=scan] .inspect-loupe{animation:ko-mascot-inspect-sweep 1280ms ease-in-out 2 both}
.sprite[data-inspection=scan] .inspect-scanline{animation:ko-mascot-inspect-line 1280ms steps(12) 2 both}
.sprite[data-inspection=reveal] .inspect-photo{animation:ko-mascot-inspect-develop 780ms ease-out both}
.sprite[data-inspection=reveal] .inspect-reticle{animation:ko-mascot-inspect-lock 780ms ease-out both}
.sprite[data-inspection=reveal] .inspect-sparks{visibility:visible;animation:ko-mascot-inspect-sparks 780ms steps(7) both}
.sprite[data-inspection=focus] canvas{animation:ko-mascot-inspect-confirm 630ms ease-out both}
.sprite[data-inspection=focus] .inspect-loupe{animation:ko-mascot-inspect-refocus 630ms cubic-bezier(.22,.74,.22,1) both}
.sprite[data-inspection=focus] .inspect-reticle{animation:ko-mascot-inspect-lock 630ms ease-out both}
.sprite[data-inspection=ready] .inspect-reticle,.sprite[data-inspection=focus] .inspect-reticle{opacity:1}
.sprite[data-inspection=put-away] .inspect-cue{animation:ko-mascot-inspect-pocket 350ms ease-in both}
.sprite.inspect-still :is(canvas,.inspect-cue,.inspect-photo,.inspect-loupe,.inspect-reticle,.inspect-scanline,.inspect-sparks){animation:none!important}
.sprite.inspect-still:is([data-inspection=scan],[data-inspection=reveal],[data-inspection=focus],[data-inspection=ready]) .inspect-reticle{opacity:1}
.sprite.inspect-still .inspect-sparks{visibility:hidden}
@keyframes ko-mascot-inspect-lean{0%{transform:none}42%{transform:rotate(calc(8deg * var(--inspect-dir))) scale(1.01,.9)}100%{transform:rotate(calc(4deg * var(--inspect-dir))) scale(1,.97)}}
@keyframes ko-mascot-inspect-photo{0%{opacity:0;transform:translate(-10%,26%) rotate(-12deg) scale(.68)}58%{opacity:1;transform:translateY(-9%) scale(1.04)}100%{transform:none}}
@keyframes ko-mascot-inspect-loupe{0%{opacity:0;transform:translate(calc(-52% * var(--inspect-dir)),43%) rotate(-18deg) scale(.65)}58%{opacity:1;transform:translateY(-13%) rotate(9deg)}100%{transform:none}}
@keyframes ko-mascot-inspect-track{0%,100%{transform:rotate(calc(3deg * var(--inspect-dir))) scale(1,.97)}50%{transform:rotate(calc(8deg * var(--inspect-dir))) scale(1.02,.91)}}
@keyframes ko-mascot-inspect-sweep{0%,100%{transform:translateX(calc(-48% * var(--inspect-dir))) rotate(-13deg)}25%{transform:translate(calc(-17% * var(--inspect-dir)),16%) rotate(-4deg)}62%{transform:translate(calc(29% * var(--inspect-dir)),25%) rotate(13deg)}87%{transform:translateY(5%)}}
@keyframes ko-mascot-inspect-line{0%,100%{opacity:0;transform:translateY(0)}12%{opacity:.95}72%{opacity:.95;transform:translateY(600%)}87%{opacity:0;transform:translateY(600%)}}
@keyframes ko-mascot-inspect-develop{0%{background:#ffedb7;filter:brightness(1.28)}29%{transform:translateY(-9%) rotate(calc(-13deg * var(--inspect-dir)))}100%{filter:none}}
@keyframes ko-mascot-inspect-lock{0%{opacity:0;scale:1.45}31%{opacity:1;scale:.88}55%,100%{opacity:1;scale:1}}
@keyframes ko-mascot-inspect-sparks{0%{opacity:0;transform:translateY(12%) scale(.64)}28%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-37%) scale(1.11)}}
@keyframes ko-mascot-inspect-confirm{0%,100%{transform:none}37%{transform:rotate(calc(5deg * var(--inspect-dir))) scale(1,.94)}68%{transform:rotate(calc(2deg * var(--inspect-dir)))}}
@keyframes ko-mascot-inspect-refocus{0%,100%{transform:none}36%{transform:translate(calc(-37% * var(--inspect-dir)),23%) scale(1.13) rotate(-12deg)}66%{transform:translate(calc(-29% * var(--inspect-dir)),19%) scale(1.03)}}
@keyframes ko-mascot-inspect-pocket{0%{opacity:1;transform:none}100%{opacity:0;transform:translate(calc(-30% * var(--inspect-dir)),24%) rotate(-13deg) scale(.56)}}
`;
