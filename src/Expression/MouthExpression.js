export default class {
  duration = null;
  aa = null;
  ee = null;
  ih = null;
  oh = null;
  ou = null;

  constructor({ duration = 0, aa = 0, ee = 0, ih = 0, oh = 0, ou = 0 } = {}) {
    this.duration = duration;
    this.aa = aa;
    this.ee = ee;
    this.ih = ih;
    this.oh = oh;
    this.ou = ou;
  }
}
