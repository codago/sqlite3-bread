function check() {
  if(document.getElementById('string').value.trim() == "") {
    alert("fill the form, please!!");
    return false;
  }
  return true;
}
