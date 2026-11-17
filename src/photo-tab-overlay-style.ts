export const photoTabOverlayStyles=`
:host{all:initial!important;position:fixed!important;inset:0!important;display:block!important;pointer-events:none!important;z-index:2147483647!important;font:14px/1.5 var(--body)!important;color:var(--ink)!important}
:host([hidden]){display:none!important}
.photo-tab-surface{position:absolute;inset:0;overflow:hidden;pointer-events:auto;cursor:crosshair;touch-action:none}
.photo-tab-surface:has(.photo-tab-rectangle[hidden]){background:#151b275e}
.photo-tab-rectangle,.photo-tab-stage{position:absolute;box-sizing:border-box;pointer-events:none}
.photo-tab-rectangle{--corner:linear-gradient(#fff,#fff);border:1px solid #fff9;outline:1px solid #25394a;box-shadow:0 0 0 100vmax #151b276f;background:
  var(--corner) left top/13px 2px,var(--corner) left top/2px 13px,
  var(--corner) right top/13px 2px,var(--corner) right top/2px 13px,
  var(--corner) left bottom/13px 2px,var(--corner) left bottom/2px 13px,
  var(--corner) right bottom/13px 2px,var(--corner) right bottom/2px 13px;
  background-repeat:no-repeat}
.photo-tab-stage{outline:1px solid #234e64;outline-offset:1px}
.photo-tab-stage>*{width:100%;height:100%;pointer-events:auto}
.photo-tab-panel{--photo-panel-edge:#d7c9ac;position:absolute;inset:16px 16px auto auto;width:min(356px,calc(100% - 32px));
  max-height:calc(100% - 32px);overflow:auto;pointer-events:auto;border:1px solid var(--photo-panel-edge);border-block-start:3px solid var(--seal);
  border-radius:7px;background:var(--paper);box-shadow:0 14px 32px #19233336,0 2px 5px #19233326;overscroll-behavior:contain;scrollbar-width:thin}
.photo-tab-panel.is-left{left:16px;right:auto}
.photo-tab-panel>header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 13px;border-bottom:1px solid var(--photo-panel-edge);background:var(--paper)}
.photo-tab-panel>header strong{font:750 15px/1.4 var(--body);color:var(--accent)}
.photo-tab-panel>header button{font-size:12px;min-height:30px}
.photo-tab-panel>div{padding:12px 13px 14px}
.photo-tab-panel>div>p{margin:0 0 10px;color:var(--muted)}
.photo-tab-panel .photo-tab-feedback:empty{display:none}
.photo-tab-panel button{border:1px solid var(--photo-panel-edge);border-radius:4px;padding:6px 9px;min-height:32px;background:#fff9ec;color:var(--ink);font:700 12px/1.4 var(--body);cursor:pointer}
.photo-tab-panel button:hover:not(:disabled){background:#e9ddc2}
.photo-tab-panel button[aria-pressed=true],.photo-tab-panel .photo-tab-primary:not(:disabled){background:var(--accent);border-color:var(--accent);color:#fff9ec}
.photo-tab-panel .photo-tab-primary:hover:not(:disabled){background:var(--ink)}
.photo-tab-actions{display:flex;flex-wrap:wrap;gap:7px}
.photo-tab-panel .photo-lookup-results{margin-top:10px}
@media(max-width:520px){.photo-tab-panel,.photo-tab-panel.is-left{inset:auto 10px 10px;width:auto;max-height:min(48vh,calc(100% - 20px))}}
@media print{:host{display:none!important}}
`;
