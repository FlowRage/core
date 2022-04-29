class Kek {
  constructor() {
    this.name = "Kek"
  }
}

const kek = new Kek();


function lel (pl) {
  if (pl instanceof Kek) {
    console.log("EEEEEEE BOY")
  } else {
    console.log("No")
  }
}

console.log(typeof Kek)