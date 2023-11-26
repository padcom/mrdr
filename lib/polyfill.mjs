Array.prototype.uniq = function(select = x => x) {
  return this.filter((item, index, self) =>
    self.findIndex(entry => select(item) === select(entry)) === index
  )
}

Array.prototype.nonEmpty = function() {
  return this.filter(x => x)
}
