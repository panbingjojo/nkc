const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    visitSettings: data.visitSettings,
    roles: data.roles,
    grades: data.grades
  },
  methods: {
    submit() {
      const {visitSettings} = this;
      nkcAPI(`/e/settings/visit`, 'PUT', {
        visitSettings
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch(sweetError);
    }
  }
})