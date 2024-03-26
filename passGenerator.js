// Classe reutilizada do meu repositorio de gerador de senhas
export default class passwordGenerator {
    // recebe os parâmetros para construção da senha (total de caractéres, quantidade de números, quantidade de caractéres especiais, quantidade de letras maiúsculas)
    // o restante será completado com letras minusculas
    constructor(...params) {
      this.length = params[0];
      this.numsLength = params[1] || 0;
      this.specialCharsLength = params[2] || 0;
      this.upperCaseCharsLength = params[3] || 0;
      //Definindo quais caracteres serão aceitos para a senha
      this.chars = "abcdefghijklmnopqrstuvwxyz";
      this.nums = "1234567890";
      this.specialChars = "!@#$%&*";
      //Separando as strings com os caracteres em arrays
      this.arrChars = this.chars.split("");
      this.arrNums = this.nums.split("");
      this.arrSpecialChars = this.specialChars.split("");
      //Variável que contém a senha
      this.password = "";
    }
    getSpecialChar() {
      for (let i = 1; i <= this.specialCharsLength; i++) {
        let iSpecialChars = Math.floor(
          Math.random() * this.arrSpecialChars.length
        );
        this.password += this.arrSpecialChars[iSpecialChars];
      }
      return this.password;
    }
    getNums() {
      for (let i = 1; i <= this.numsLength; i++) {
        let iNums = Math.floor(Math.random() * this.arrNums.length);
        this.password += this.arrNums[iNums];
      }
      return this.password;
    }
    getChars() {
      let CharsLength = this.length - this.numsLength - this.specialCharsLength;
      for (let i = 1; i <= CharsLength; i++) {
        let iChars = Math.floor(Math.random() * this.arrChars.length);
        let char =
          i <= this.upperCaseCharsLength
            ? this.arrChars[iChars].toUpperCase()
            : this.arrChars[iChars];
        this.password += char;
      }
      return this.password;
    }
    getPassword() {
      // Esvazia a váriavel para caso o método seja chamado novamente pela mesma instancia
      this.password = "";
      //
      this.getSpecialChar();
      this.getNums();
      this.getChars();
      let arrPw = this.password.split("");
      for (let i = arrPw.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrPw[i], arrPw[j]] = [arrPw[j], arrPw[i]];
      }
      this.password = arrPw.join("");
      return this.password;
    }
}