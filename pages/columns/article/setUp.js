function showSetUp(){
  const childH = $('.set-up')[0].children[0].clientHeight
  const selfH = $('.set-up')[0].clientHeight;
  if(selfH === 0){
    // $('.set-up')[0].classList.add('set-up-active')
    $('.set-up').height(childH)
  }else if(selfH === childH){
    // $('.set-up')[0].classList.remove('set-up-active')
    $('.set-up').height(0)
  }
}

Object.assign(window, {
  showSetUp
})

