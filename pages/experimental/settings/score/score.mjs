const data = NKC.methods.getDataById('data');
const selectImage = new NKC.methods.selectImage();
const {scores} = data.scoreSettings;
const arr = [];
const typeArr = [];
const nameArr = [];
const iconArr = [];
const unitArr = [];
const weightArr = [];
const m2sArr = [];
const s2mArr = [];
const s2oArr = [];
const o2sArr = [];

const scoresObj = {};

for(const s of scores) {
  scoresObj[s.type] = s;
  const {
    type, enabled, name, icon, unit,
    money2score, score2other, other2score, score2money,
    weight
  } = s;
  typeArr.push({
    type,
    enabled,
  });
  nameArr.push({
    type,
    name,
  });
  iconArr.push({
    type,
    icon,
    iconFile: '',
    iconData: ''
  });
  unitArr.push({
    type,
    unit
  });
  weightArr.push({
    type,
    weight
  });
  m2sArr.push({
    type,
    money2score
  });
  s2mArr.push({
    type,
    score2money
  });
  s2oArr.push({
    type,
    score2other
  });
  o2sArr.push({
    type,
    other2score
  });
}

const app = new Vue({
  el: '#app',
  data: {
    scoreSettings: data.scoreSettings,
    typeArr,
    nameArr,
    iconArr,
    unitArr,
    weightArr,
    m2sArr,
    s2mArr,
    s2oArr,
    o2sArr
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    selectIcon(a) {
      selectImage.show(blob => {
        const file = NKC.methods.blobToFile(blob);
        NKC.methods.fileToUrl(file)
          .then(data => {
            a.iconData = data;
            a.iconFile = file;
            selectImage.close();
          });
      }, {
        aspectRatio: 1
      });
    },
    save() {
      const {
        typeArr, nameArr, iconArr, unitArr,
        weightArr, m2sArr, s2mArr, s2oArr, o2sArr
      } = this;
      typeArr.map(({type, enabled}) => {
        scoresObj[type].enabled = enabled;
      });
      nameArr.map(({type, name}) => {
        scoresObj[type].name = name;
      });
      unitArr.map(({type, unit}) => {
        scoresObj[type].unit = unit;
      });
      weightArr.map(({type, weight}) => {
        scoresObj[type].weight = weight;
      });
      m2sArr.map(({type, money2score}) => {
        scoresObj[type].money2score = money2score;
      });
      s2mArr.map(({type, score2money}) => {
        scoresObj[type].score2money = score2money;
      });
      s2oArr.map(({type, score2other}) => {
        scoresObj[type].score2other = score2other;
      });
      o2sArr.map(({type, other2score}) => {
        scoresObj[type].other2score = other2score;
      });
      this.scoreSettings.scores = scoresObj;
      const formData = new FormData();
      formData.append('scoreSettings', JSON.stringify(this.scoreSettings));
      for(const icon of iconArr) {
        const {iconFile, type} = icon;
        if(!iconFile) continue;
        formData.append(type, iconFile);
      }
    }
  }
});

